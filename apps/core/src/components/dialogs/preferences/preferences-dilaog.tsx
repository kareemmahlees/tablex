import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreferencesState } from "@/state/dialogState"
import { lazy, Suspense } from "react"

import LoadingSpinner from "@/components/loading-spinner"
import hotkeys from "hotkeys-js"
const GeneralTab = lazy(() => import("./components/general-tab"))

const PreferencesDialog = () => {
  const { isOpen, toggleDialog } = usePreferencesState()

  hotkeys("ctrl+,,command+,", () => toggleDialog(!isOpen))
  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent
        className="h-5/6 w-5/6 max-w-full bg-[#252525] p-0 lg:w-4/6"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs defaultValue="general" orientation="vertical" className="flex">
          <aside className="w-1/6 bg-[#1a1d1e] lg:w-[160px]">
            <TabsList className="mt-3 w-full flex-col gap-y-2 bg-transparent lg:gap-y-3">
              <TabsTrigger value="general" className="w-full justify-start">
                General
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full justify-start">
                Settings
              </TabsTrigger>
              <TabsTrigger value="keybindings" className="w-full justify-start">
                Keybindings
              </TabsTrigger>
            </TabsList>
          </aside>
          <section className="mt-3 h-full w-full px-8 lg:px-10">
            <Suspense fallback={<LoadingSpinner />}>
              <GeneralTab />
              <TabsContent value="settings">TODO</TabsContent>
              <TabsContent value="keybindings">TODO</TabsContent>
            </Suspense>
          </section>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default PreferencesDialog
