import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import Fuse from "fuse.js"
import { Keyboard, SearchIcon } from "lucide-react"
import { useState } from "react"

const SHORTCUTS: { action: string; shortcut: string[] }[] = [
  {
    action: "Show Available Shortcuts",
    shortcut: ["Ctrl", "/"]
  },
  {
    action: "Open Command Palette",
    shortcut: ["Ctrl", "k"]
  },
  {
    action: "Insert New Row",
    shortcut: ["n"]
  },
  {
    action: "Delete Selected Rows",
    shortcut: ["Delete"]
  },
  {
    action: "Open Sort Menu",
    shortcut: ["s"]
  },
  {
    action: "Reset Sort Menu",
    shortcut: ["Shift", "s"]
  },

  {
    action: "Open Filter Menu",
    shortcut: ["f"]
  },
  {
    action: "Reset Filter Menu",
    shortcut: ["Shift", "f"]
  },
  {
    action: "Delete Filter",
    shortcut: ["Backspace"]
  },
  {
    action: "Run Query",
    shortcut: ["F5"]
  },
  {
    action: "Prettify Query",
    shortcut: ["F6"]
  }
]

const fuse = new Fuse(SHORTCUTS, {
  keys: ["action"],
  threshold: 0.2
})

export const AvailableKeybindings = () => {
  const [shortcuts, setShortcuts] = useState(SHORTCUTS)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton className="w-fit">
          <Keyboard />
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            A list of the currently registered keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupInput
            placeholder="Search for shortcut..."
            onChange={(e) => {
              if (e.target.value === "") {
                setShortcuts(SHORTCUTS)
              } else {
                setShortcuts(fuse.search(e.target.value).map((res) => res.item))
              }
            }}
          />
          <InputGroupAddon align={"inline-end"}>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <ScrollArea className="h-72 w-full" type="always">
          <div className="[&>div]:overflow-visible">
            <Table className="w-full overflow-hidden rounded-lg">
              <TableHeader className="bg-sidebar">
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Shortcut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortcuts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      rowSpan={10}
                      className="text-muted-foreground text-center"
                    >
                      No Matches Found
                    </TableCell>
                  </TableRow>
                ) : (
                  shortcuts.map((s) => (
                    <TableRow>
                      <TableCell>{s.action}</TableCell>
                      <TableCell>
                        <KbdGroup>
                          {s.shortcut.map((ss) => (
                            <Kbd>{ss}</Kbd>
                          ))}
                        </KbdGroup>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
