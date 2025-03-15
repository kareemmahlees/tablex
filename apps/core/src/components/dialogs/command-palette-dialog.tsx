import { commands } from "@/bindings"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useCommandPaletteState,
  useMetaXState,
  usePreferencesState
} from "@/state/dialogState"
import { cn } from "@tablex/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import hotkeys from "hotkeys-js"
import {
  FileJson2,
  FileText,
  Globe2,
  Link,
  Settings2,
  Terminal
} from "lucide-react"
import { Button } from "../ui/button"

const CommandPalette = () => {
  const { isOpen, toggleDialog } = useCommandPaletteState()

  hotkeys("ctrl+k,command+k", () => toggleDialog(!isOpen))

  return (
    <>
      <Button
        onClick={() => toggleDialog(true)}
        variant="outline"
        className={cn(
          "bg-muted/50 text-muted-foreground relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none"
        )}
      >
        Search...
      </Button>
      <CommandDialog open={isOpen} onOpenChange={toggleDialog}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandEmpty>No results found.</CommandEmpty>
        <ScrollArea className="max-h-[300px] overflow-auto">
          <GeneralGroup />
          <ConnectionsGroup />
          <UtilitiesGroup />
          <ConfigurationGroup />
        </ScrollArea>
      </CommandDialog>
    </>
  )
}

export default CommandPalette

const GeneralGroup = () => {
  const { toggleDialog: togglePreferences } = usePreferencesState()
  const { toggleDialog: toggleCommandPalette } = useCommandPaletteState()

  return (
    <CommandGroup heading="General">
      <CommandItem
        onSelect={() => {
          toggleCommandPalette()
          togglePreferences()
        }}
      >
        <Settings2 />
        Preferences
      </CommandItem>
    </CommandGroup>
  )
}

const ConnectionsGroup = () => {
  const navigate = useNavigate()
  return (
    <CommandGroup heading="Connections">
      <CommandItem onSelect={() => navigate({ to: "/connections" })}>
        <Globe2 />
        Go to Connections
      </CommandItem>
      <CommandItem onSelect={() => navigate({ to: "/connect" })}>
        <Link className="h-4 w-4" />
        Create Connection
      </CommandItem>
    </CommandGroup>
  )
}

const UtilitiesGroup = () => {
  const { toggleDialog: toggleCommandPalette } = useCommandPaletteState()
  const { toggleDialog: toggleMetaXDialog } = useMetaXState()
  const navigate = useNavigate()

  return (
    <CommandGroup heading="Utilities">
      <CommandItem
        onSelect={() => {
          toggleCommandPalette()
          toggleMetaXDialog()
        }}
      >
        <FileText className="h-4 w-4" />
        Show API Docs
      </CommandItem>
      <CommandItem onSelect={() => navigate({ to: "/dashboard/sql-editor" })}>
        <Terminal className="h-4 w-4" />
        SQL Editor
      </CommandItem>
    </CommandGroup>
  )
}

const ConfigurationGroup = () => {
  const { toggleDialog } = useCommandPaletteState()

  return (
    <CommandGroup heading="Configuration">
      <CommandItem
        onSelect={async () => {
          commands.openInExternalEditor("settings")
          toggleDialog()
        }}
      >
        <FileJson2 className="h-4 w-4" />
        Open settings.json
      </CommandItem>
      <CommandItem
        onSelect={async () => {
          commands.openInExternalEditor("keybindings")
          toggleDialog()
        }}
      >
        <FileJson2 className="h-4 w-4" />
        Open keybindings.json
      </CommandItem>
    </CommandGroup>
  )
}
