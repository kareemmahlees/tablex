import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreferencesState } from "@/state/dialogState"

import hotkeys from "hotkeys-js"

const PreferencesDialog = () => {
  const { isOpen, toggleDialog } = usePreferencesState()

  hotkeys("ctrl+,,command+,", () => toggleDialog(!isOpen))
  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent
        className="h-5/6 w-5/6 max-w-full bg-[#282828] p-0 text-sm lg:text-base"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs defaultValue="general" orientation="vertical" className="flex">
          <aside className="w-1/6 bg-[#1a1d1e] lg:w-[160px]">
            <TabsList className="w-full flex-col items-start gap-y-2 bg-transparent lg:gap-y-3">
              <TabsTrigger value="general" className="w-full">
                General
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full">
                Settings
              </TabsTrigger>
              <TabsTrigger value="keybindings" className="w-full">
                Keybindings
              </TabsTrigger>
            </TabsList>
          </aside>
          <section className="h-full w-full px-4">
            <TabsContent value="general">TODO</TabsContent>
            <TabsContent value="settings">TODO</TabsContent>
            <TabsContent value="keybindings">TODO</TabsContent>
          </section>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default PreferencesDialog
