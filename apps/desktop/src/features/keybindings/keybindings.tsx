import { commands, type Keybinding } from "@/bindings"
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
import { Kbd } from "@/components/ui/kbd"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useKeybindings, type EditedBinding } from "@/features/keybindings"
import { Edit2, FileJson2 } from "lucide-react"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { toast } from "sonner"

export const Keybindings = () => {
  const keybindings = useKeybindings()
  const [editedKeybindings, setEditKeybindings] = useState<EditedBinding[]>([])

  const handleKeybindingsSave = async () => {
    const result = await commands.writeIntoKeybindingsFile(keybindings.bindings)
    if (result.status === "error") {
      return toast.error("Failed to update keybindings", {
        description: "Please try again"
      })
    }
    keybindings.reRegister(editedKeybindings)
    toast.success("Keybindings updated successfully")
  }

  return (
    <section>
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
            <TableRow className="group border-zinc-700" key={idx}>
              <TableCell>
                <code>{binding.command}</code>
              </TableCell>
              <TableCell className="space-x-2">
                {binding.shortcuts.map((b, idx) => (
                  <Kbd key={idx}>{b}</Kbd>
                ))}
              </TableCell>
              <TableCell>
                <KeyRecorderDialog
                  binding={binding}
                  setEditedKeybindings={setEditKeybindings}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="absolute bottom-7 right-4 flex flex-row-reverse items-center gap-x-3">
        <Button size={"sm"} onClick={handleKeybindingsSave}>
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
    </section>
  )
}

type KeyRecorderProps = {
  binding: Keybinding
  setEditedKeybindings: Dispatch<SetStateAction<EditedBinding[]>>
}

const KeyRecorderDialog = ({
  binding,
  setEditedKeybindings
}: KeyRecorderProps) => {
  const [key, setKey] = useState<string[]>([])
  const recordKeys = (e: KeyboardEvent) => {
    if (e.repeat) return
    e.preventDefault()

    let preparedKey: string

    switch (e.key) {
      // for the sake of hotkey-js to recognize them.
      case "Control":
      case "Shift":
      case "Alt":
        preparedKey = e.key.toLowerCase()
        break
      default:
        preparedKey = e.key
    }

    setKey((old) => [...old, preparedKey])
  }

  useEffect(() => {
    document.addEventListener("keydown", recordKeys)
    return () => document.removeEventListener("keydown", recordKeys)
  }, [key])

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          document.removeEventListener("keydown", recordKeys)
        }
      }}
    >
      <DialogTrigger asChild className="invisible group-hover:visible">
        <Edit2 className="h-4 w-4" role="button" />
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
              <Button
                onClick={() => {
                  binding.shortcuts = [key.join("+")]
                  setEditedKeybindings((old) => [
                    ...old,
                    { command: binding.command, shortcuts: binding.shortcuts }
                  ])
                }}
              >
                Done
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
