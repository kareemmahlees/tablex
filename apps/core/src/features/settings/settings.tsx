import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreferencesState } from "@/state/dialogState"
import hotkeys from "hotkeys-js"
import { PreferencesTab } from "./tabs/preferences"

export const Settings = () => {
  const { isOpen, toggleDialog } = usePreferencesState()

  hotkeys("ctrl+,,command+,", () => toggleDialog(!isOpen))
  return (
    <Tabs
      defaultValue="preferences"
      orientation="vertical"
      className="flex h-full w-full"
    >
      <aside className="w-1/6 bg-[#1a1d1e] pt-3 lg:w-[160px]">
        <TabsList className="w-full flex-col gap-y-2 bg-transparent lg:gap-y-3">
          <TabsTrigger value="preferences" className="w-full justify-start">
            Preferences
          </TabsTrigger>
        </TabsList>
      </aside>
      <section className="relative mx-auto h-full w-1/2 px-8 pt-3 lg:px-10">
        <PreferencesTab />
      </section>
    </Tabs>
  )
}
