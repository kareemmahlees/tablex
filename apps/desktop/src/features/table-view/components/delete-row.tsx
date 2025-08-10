import { commands, RowRecord } from "@/bindings"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { Table } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { useTableSchema } from "../context"

export const DeleteRowBtn = ({ table }: { table: Table<any> }) => {
  const { pkCols, tableSchema } = useTableSchema()
  const rowsToDelete: RowRecord[][] = useMemo(
    () =>
      table.getSelectedRowModel().flatRows.map((r) =>
        pkCols.map((col) => ({
          columnName: col.name,
          value: r.getValue(col.name),
          columnType: col.type
        }))
      ),
    [table.getSelectedRowModel().flatRows]
  )

  const handleDeleteRows = () => {
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

  useHotkeys("delete", handleDeleteRows, {
    ignoreEventWhen: (e) =>
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
  })

  return (
    <TooltipButton
      size={"icon"}
      variant={"destructive"}
      className="h-8 w-8"
      tooltipContent="Delete"
      onClick={handleDeleteRows}
      disabled={rowsToDelete.length === 0}
    >
      <Trash2 className="size-4" />
    </TooltipButton>
  )
}
