import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import { File, FileJson2, Settings2, Terminal } from "lucide-react"

const CommandPalette = () => {
  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="General">
          <CommandItem className="space-x-2">
            <Settings2 className="h-4 w-4" /> <p>Preferences</p>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Utilities">
          <CommandItem className="space-x-2">
            <File className="h-4 w-4" /> <p>Show API Docs</p>
          </CommandItem>
          <CommandItem className="space-x-2">
            <Terminal className="h-4 w-4" /> <p>Open SQL Editor</p>{" "}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem className="space-x-2">
            <FileJson2 className="h-4 w-4" />
            <p> Open settings.json</p>
          </CommandItem>
          <CommandItem className="space-x-2">
            <FileJson2 className="h-4 w-4" />
            <p> Open keybindings.json</p>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export default CommandPalette
