import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { ReactElement } from "react"
import Card from "./Card"

const KbdShortcutsCard = () => {
  return (
    <Card
      className="md:flex-col"
      header="Keyboard shortcuts everywhere"
      content={
        <div>
          <p>If you Love to use your keyboard very often, We Got you.</p>
          <br />
          <span className="font-semibold text-foreground">TableX</span> is
          designed to be keyboard friendly from the start, while we don&apos;t
          have that much of shortcuts available right now, but more and more
          will be added soon.
        </div>
      }
    >
      <ShortcutsTable />
    </Card>
  )
}

export default KbdShortcutsCard

const ShortcutsTable = () => {
  const shortcuts: { shortcut: ReactElement; description: string }[] = [
    {
      shortcut: (
        <div>
          <kbd>Ctrl</kbd> + <kbd>k</kbd>
        </div>
      ),
      description: "open command palette"
    },
    {
      shortcut: (
        <div>
          <kbd>Ctrl</kbd> + <kbd>s</kbd>
        </div>
      ),
      description: "focus search input"
    },
    {
      shortcut: (
        <div>
          <kbd>Ctrl</kbd> + <kbd>a</kbd>
        </div>
      ),
      description: "select or deselect all"
    },
    {
      shortcut: (
        <div>
          <kbd>Ctrl</kbd> + <kbd>c</kbd>
        </div>
      ),
      description: "copy selected rows into clipboard"
    },
    {
      shortcut: <kbd>Delete</kbd>,
      description: "delete selected rows"
    }
  ]
  return (
    <div className="mt-4">
      <Table>
        <TableCaption>Available Keyboard shortcuts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Shortcut</TableHead>
            <TableHead className="">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shortcuts.map(({ shortcut, description }, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell className="font-medium whitespace-nowrap">
                  {shortcut}
                </TableCell>
                <TableCell className="font-medium">{description}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
