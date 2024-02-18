import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { ReactElement } from "react"

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
    <table className="mt-4">
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
                <TableCell className="whitespace-nowrap font-medium">
                  {shortcut}
                </TableCell>
                <TableCell className="font-medium">{description}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </table>
  )
}

export default ShortcutsTable
