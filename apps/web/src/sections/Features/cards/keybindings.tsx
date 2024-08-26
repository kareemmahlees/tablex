import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

const Keybindings = () => {
  return (
    <div className="rounded-md border-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Command</TableHead>
            <TableHead>Shortcuts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>focusSearch</TableCell>
            <TableCell>
              <kbd>Ctrl+S</kbd>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>copyRow</TableCell>
            <TableCell>
              <kbd>Ctrl+C</kbd>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default Keybindings
