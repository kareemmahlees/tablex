import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Globe2, Link } from "lucide-react"
import { useRouter } from "next/navigation"

import { useEffect, useState } from "react"

const CommandPalette = () => {
  const router = useRouter()
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
          <CommandItem
            className="flex items-center gap-x-2"
            onSelect={() => router.push("/connections")}
          >
            <Globe2 />
            Go to Connections
          </CommandItem>
          <CommandItem
            className="flex items-center gap-x-2"
            onSelect={() => router.push("/connect")}
          >
            <Link className="w-4 h-4" />
            Create Connection
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
