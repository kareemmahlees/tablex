import { commands, events } from "@/bindings"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { useNavigate } from "@tanstack/react-router"
import hotkeys from "hotkeys-js"
import { FileJson2, FileText, Globe2, Link, Terminal } from "lucide-react"
import { type Dispatch, type SetStateAction, useState } from "react"

const CommandPalette = () => {
  const [open, setOpen] = useState(false)

  hotkeys("ctrl+k,command+k", () => setOpen(true))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <ConnectionsGroup />
        <UtilitiesGroup setOpen={setOpen} />
        <ConfigurationGroup setOpen={setOpen} />
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

const UtilitiesGroup = ({
  setOpen
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <CommandGroup heading="Utilities">
      <CommandItem
        onSelect={() => {
          setOpen(false)
          events.metaXDialogOpen.emit()
        }}
      >
        <FileText className="h-4 w-4" />
        Show API Docs
      </CommandItem>
      <CommandItem
        onSelect={() => {
          setOpen(false)
          events.sqlDialogOpen.emit()
        }}
      >
        <Terminal className="h-4 w-4" />
        SQL Editor
      </CommandItem>
    </CommandGroup>
  )
}

const ConfigurationGroup = ({
  setOpen
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <CommandGroup heading="Configuration">
      <CommandItem
        onSelect={async () => {
          commands.openInExternalEditor("settings")
          setOpen(false)
        }}
      >
        <FileJson2 className="h-4 w-4" />
        Open settings.json
      </CommandItem>
      <CommandItem
        onSelect={async () => {
          commands.openInExternalEditor("keybindings")
          setOpen(false)
        }}
      >
        <FileJson2 className="h-4 w-4" />
        Open keybindings.json
      </CommandItem>
    </CommandGroup>
  )
}
