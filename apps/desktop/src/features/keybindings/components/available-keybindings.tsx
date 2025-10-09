import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Keyboard } from "lucide-react"

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

export const AvailableKeybindings = () => {
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
        <Table className="w-full overflow-hidden rounded-lg">
          <TableHeader className="bg-sidebar">
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Shortcut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SHORTCUTS.map((s) => (
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
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
