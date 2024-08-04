import { type ColumnProps, commands } from "@/bindings"
import { Checkbox } from "@/components/ui/checkbox"
import { unwrapResult } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import SortingButton from "./sorting-btn"

export const generateColumnsDefs = async (tableName: string) => {
  const columnsResult = await commands.getColumnsProps(tableName)
  const columns = unwrapResult(columnsResult)
  const columnsDefinitions = columns.map(
    ({ columnName, isPK, hasFkRelations }) => {
      const columnDefinition: ColumnDef<ColumnProps> = {
        accessorKey: columnName,
        // types for `meta` come from env.d.ts
        meta: {
          name: columnName,
          hasFkRelations
        },
        header: ({ column }) => {
          return <SortingButton column={column} title={columnName} />
        },
        cell: (info) => {
          // Clamp long text.
          const value = info.getValue() as string
          let cellContent = value
          if (value && value.length > 20) {
            cellContent = value.slice(0, 15) + "..."
          }
          return <span>{cellContent}</span>
        }
      }
      columnDefinition.id = isPK ? "pk" : columnDefinition.accessorKey
      return columnDefinition
    }
  )

  appendCheckboxColumn(columnsDefinitions)

  return columnsDefinitions
}

// Appends an extra checkbox column at the beginning of all columns
const appendCheckboxColumn = (columns: ColumnDef<ColumnProps>[]) => {
  columns.unshift({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => {
          if (table.getIsSomeRowsSelected()) {
            table.toggleAllRowsSelected(false)
          } else {
            table.toggleAllPageRowsSelected(!!value)
          }
        }}
        aria-label="Select or Deselect all"
      />
    ),
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      )
    },
    enableSorting: false,
    enableHiding: false
  })
}
