import { events } from "@/bindings"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { useNavigate } from "@tanstack/react-router"
import { FileText, Globe2, Link, Terminal } from "lucide-react"
import { useEffect, useState } from "react"

const CommandPalette = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Connections">
          <CommandItem onSelect={() => navigate({ to: "/connections" })}>
            <Globe2 />
            Go to Connections
          </CommandItem>
          <CommandItem onSelect={() => navigate({ to: "/connect" })}>
            <Link className="h-4 w-4" />
            Create Connection
          </CommandItem>
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
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
