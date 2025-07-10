import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { QUERY_KEYS } from "@/lib/constants"
import { useQuery } from "@tanstack/react-query"
import { getVersion } from "@tauri-apps/api/app"
import { ask } from "@tauri-apps/plugin-dialog"
import { check } from "@tauri-apps/plugin-updater"
import { Info } from "lucide-react"

export const About = () => {
  const { data: appVersion } = useQuery({
    queryKey: [QUERY_KEYS.GET_APP_VERSION],
    queryFn: getVersion
  })
  const { isLoading, refetch: checkForUpdate } = useCheckForUpdate()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton className="w-fit lg:h-9">
          <Info />
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-start gap-y-3">
        <DialogHeader>
          <DialogTitle>TableX</DialogTitle>
          <DialogDescription>Current Version: {appVersion}</DialogDescription>
        </DialogHeader>
        <div className="flex w-full items-center justify-between">
          <div>
            <Button
              variant={"link"}
              size={"sm"}
              className="text-muted-foreground m-0 p-0"
            >
              read the changelog
            </Button>
          </div>
          <LoadingButton
            size={"sm"}
            loading={isLoading}
            onClick={async () => await checkForUpdate()}
          >
            Check for updates
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const useCheckForUpdate = () => {
  return useQuery({
    queryKey: ["check_for_updates"],
    queryFn: async () => {
      // Only run updater logic in production
      if (import.meta.env.DEV) {
        await Bun.sleep(3000)
        return ""
      }

      const update = await check()
      if (update) {
        const yes = await ask(
          `TableX v${update.version} is now available -- you have v${update.currentVersion}.\n\nWould you like to install it now?`
        )
        if (yes) {
          await update.downloadAndInstall()
        }
      }
    },
    enabled: false
  })
}
