import { commands, events } from "@/bindings"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { useCommandPaletteState, useMetaXState } from "@/state/dialogState"
import { useNavigate } from "@tanstack/react-router"
import hotkeys from "hotkeys-js"
import { FileJson2, FileText, Globe2, Link, Terminal } from "lucide-react"

const CommandPalette = () => {
  const { isOpen, toggleDialog } = useCommandPaletteState()

  hotkeys("ctrl+k,command+k", () => toggleDialog())

  return (
    <CommandDialog open={isOpen} onOpenChange={toggleDialog}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <ConnectionsGroup />
        <UtilitiesGroup />
        <ConfigurationGroup />
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette

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
      <CommandItem
        onSelect={() => {
          toggleCommandPalette()
          events.sqlDialogOpen.emit()
        }}
      >
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
