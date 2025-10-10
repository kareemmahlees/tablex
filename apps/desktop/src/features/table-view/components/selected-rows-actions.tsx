import { commands, RowRecord } from "@/bindings"
import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"
import { toast } from "sonner"
import { useTableSchema } from "../context"

export const SelectedRowsActions = ({ table }: { table: Table<any> }) => {
  if (table.getSelectedRowModel().rows.length === 0) return null

  return (
    <div className="space-x-3">
      <DeleteRowsBtn table={table} />
      <Button variant="outline" size="sm" className="h-8 space-x-2">
        <span>Copy As</span>
      </Button>
    </div>
  )
}

const DeleteRowsBtn = ({ table }: { table: Table<any> }) => {
  const { pkCols, tableSchema } = useTableSchema()

  const handleDeleteRows = () => {
    const rowsToDelete: RowRecord[][] = table
      .getSelectedRowModel()
      .flatRows.map((r) =>
        pkCols.map((col) => ({
          columnName: col.name,
          value: r.getValue(col.name),
          columnType: col.type
        }))
      )

    if (pkCols.length === 0)
      return toast.warning("No primary key defined for this table.")

    toast.promise(commands.deleteRows(rowsToDelete, tableSchema.name), {
      success: () => {
        table.toggleAllRowsSelected(false)
        return `Successfully deleted ${rowsToDelete.length} row(s).`
      },
      error: () => {
        return "Something went wrong."
      }
    })
  }

  return (
    <Button
      variant="destructive"
      className="h-8"
      size={"sm"}
      onClick={handleDeleteRows}
    >
      Delete {table.getSelectedRowModel().rows.length} row(s)
    </Button>
  )
}
