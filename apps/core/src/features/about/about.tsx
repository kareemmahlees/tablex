import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { getVersion } from "@tauri-apps/api/app"
import { ask } from "@tauri-apps/plugin-dialog"
import { check } from "@tauri-apps/plugin-updater"
import { Info } from "lucide-react"
import { useLayoutEffect, useState } from "react"

export const About = () => {
  const [appVersion, setAppVersion] = useState<string>()
  const { isLoading, refetch: checkForUpdate } = useCheckForUpdate()

  useLayoutEffect(() => {
    getVersion().then((version) => setAppVersion(version))
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton className="lg:h-9">
          <Info />
          <span className="lg:text-base">{"About"}</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-start gap-y-3">
        <h3 className="font-bold">TableX</h3>
        <Separator className="bg-zinc-700" />
        <div className="flex w-full items-center justify-between">
          <div>
            <p>Current Version: {appVersion}</p>
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
