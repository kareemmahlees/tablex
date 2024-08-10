import Kbd from "@/components/kbd"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { useKeybindings } from "@/keybindings/manager"
import { Edit2 } from "lucide-react"

const KeybindingsTab = () => {
  const keybindings = useKeybindings()
  return (
    <TabsContent value="keybindings">
      <Table>
        <TableHeader className="font-bold">
          <TableRow>
            <TableHead>Command</TableHead>
            <TableHead>Shortcuts</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keybindings.bindings.map((binding, idx) => (
            <TableRow className="border-zinc-700" key={idx}>
              <TableCell>
                <code>{binding.command}</code>
              </TableCell>
              <TableCell className="space-x-2">
                {binding.shortcuts.map((b) => (
                  <Kbd>{b}</Kbd>
                ))}
              </TableCell>
              <TableCell>
                <Button variant={"ghost"}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabsContent>
  )
}

export default KeybindingsTab
