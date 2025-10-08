import { commands } from "@/bindings"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@tablex/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import hotkeys from "hotkeys-js"
import { FileJson2, FileText, Globe2, Settings2, Terminal } from "lucide-react"
import { useCommandPaletteState } from "./state"

const CommandPalette = () => {
  const { isOpen, toggleDialog } = useCommandPaletteState()

  hotkeys("ctrl+k,command+k", () => toggleDialog(!isOpen))

  return (
    <>
      <Button
        onClick={() => toggleDialog(true)}
        variant="outline"
        className={cn(
          "flex items-center justify-between px-2.5",
          "bg-muted/50 text-muted-foreground relative h-8 w-full rounded-[0.5rem] text-sm font-normal shadow-none"
        )}
      >
        <span>Search...</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
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
  const navigate = useNavigate()
  const { toggleDialog } = useCommandPaletteState()

  return (
    <CommandGroup heading="General">
      <CommandItem
        onSelect={() => {
          navigate({ to: "/settings/preferences" })
          toggleDialog()
        }}
      >
        <Settings2 />
        Settings
      </CommandItem>
    </CommandGroup>
  )
}

const ConnectionsGroup = () => {
  const navigate = useNavigate()
  const { toggleDialog } = useCommandPaletteState()
  return (
    <CommandGroup heading="Connections">
      <CommandItem
        onSelect={() => {
          navigate({ to: "/" })
          toggleDialog()
        }}
      >
        <Globe2 />
        Go to Connections
      </CommandItem>
    </CommandGroup>
  )
}

const UtilitiesGroup = () => {
  const { toggleDialog } = useCommandPaletteState()
  const navigate = useNavigate()

  return (
    <CommandGroup heading="Utilities">
      <CommandItem
        onSelect={() => {
          toggleDialog()
          navigate({ to: "/connection/$connId/utilities" })
        }}
      >
        <FileText className="h-4 w-4" />
        Show API Docs
      </CommandItem>
      <CommandItem
        onSelect={() => {
          toggleDialog()
          navigate({ to: "/connection/$connId/sql-editor" })
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
