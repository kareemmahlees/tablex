import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { TabsContent } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { getVersion } from "@tauri-apps/api/app"
import { ask } from "@tauri-apps/plugin-dialog"
import { check } from "@tauri-apps/plugin-updater"
import { useLayoutEffect, useState } from "react"

const GeneralTab = () => {
  const [appVersion, setAppVersion] = useState<string>()
  const { isLoading, refetch } = useQuery({
    queryKey: ["check_for_updates"],
    queryFn: async () => {
      // Only run installer logic in production
      if (import.meta.env.DEV) {
        await new Promise((res) => setTimeout(res, 3000))
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

  useLayoutEffect(() => {
    getVersion().then((version) => setAppVersion(version))
  })

  return (
    <TabsContent value="general" className="flex flex-col items-start gap-y-3">
      <h3 className="font-bold">App</h3>
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
          onClick={async () => await refetch()}
        >
          Check for updates
        </LoadingButton>
      </div>
      <Separator className="bg-zinc-700" />
      <div className="flex w-full items-center justify-between">
        <div>
          <p>Automatic Updates</p>
          <p className="text-muted-foreground text-sm">
            TableX will regularly check for updates.
          </p>
        </div>
        <Switch className="data-[state=unchecked]:bg-zinc-700" />
      </div>
    </TabsContent>
  )
}

export default GeneralTab
