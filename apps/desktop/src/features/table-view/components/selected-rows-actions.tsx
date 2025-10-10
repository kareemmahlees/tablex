import { commands, RowRecord } from "@/bindings"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { asString, generateCsv, mkConfig } from "export-to-csv"
import { ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"
import { useTableSchema } from "../context"

export const SelectedRowsActions = ({ table }: { table: Table<any> }) => {
  if (table.getSelectedRowModel().rows.length === 0) return null

  return (
    <div className="space-x-3">
      <DeleteRowsBtn table={table} />
      <CopyRowsBtn table={table} />
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

const CopyRowsBtn = ({ table }: { table: Table<any> }) => {
  const getRowsAsJson = () => {
    const objs: Record<string, any>[] = []
    const columns = table.getAllColumns()
    const rows = table.getSelectedRowModel().rows
    for (const row of rows) {
      const obj = {}
      for (const col of columns) {
        // Remove the select checkbox column
        if (col.id === "select") continue
        obj[col.id] = row.getValue(col.id)
      }
      objs.push(obj)
    }
    return objs
  }

  const copyRowsAsJson = () => {
    toast.promise(writeText(JSON.stringify(getRowsAsJson(), undefined, 2)), {
      success: "Successfully copied rows as JSON"
    })
  }

  const copyRowsAsCSV = () => {
    const csvConfig = mkConfig({ useKeysAsHeaders: true })

    const csv = generateCsv(csvConfig)(getRowsAsJson())
    const csvString = asString(csv)

    toast.promise(writeText(csvString), {
      success: "Successfully copied rows as CSV"
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8">
          Copy As
          <ChevronDownIcon
            className="opacity-60"
            size={16}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-(--radix-dropdown-menu-trigger-width)"
        align="start"
      >
        <DropdownMenuItem onSelect={copyRowsAsJson}>
          Copy as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyRowsAsCSV}>
          Copy as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
