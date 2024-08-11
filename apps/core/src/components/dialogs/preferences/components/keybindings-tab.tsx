import { commands, type Keybinding } from "@/bindings"
import Kbd from "@/components/kbd"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
import { Edit2, FileJson2 } from "lucide-react"
import { useEffect, useState } from "react"

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
                <KeyRecorderDialog binding={binding} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="absolute bottom-7 right-4 flex flex-row-reverse items-center gap-x-3">
        <Button
          size={"sm"}
          onClick={() => {
            // TODO: write into keybindings file.
          }}
        >
          Save
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={async () =>
            await commands.openInExternalEditor("keybindings")
          }
        >
          <FileJson2 className="h-4 w-4" />
        </Button>
      </div>
    </TabsContent>
  )
}

export default KeybindingsTab

const KeyRecorderDialog = ({ binding }: { binding: Keybinding }) => {
  const [key, setKey] = useState<string[]>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      setKey((old) => [...old, e.key])
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [key])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>
            Press desired key combination and then press ENTER
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-full flex-col items-center gap-y-5">
          <Input
            className="bg-muted w-1/2"
            value={key.join("+")}
            readOnly
            disabled
          />
          <div className="flex items-center gap-x-4">
            <Button variant={"secondary"} onClick={() => setKey([])}>
              Reset
            </Button>
            <DialogClose asChild>
              <Button onClick={() => (binding.shortcuts = key)}>Done</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
