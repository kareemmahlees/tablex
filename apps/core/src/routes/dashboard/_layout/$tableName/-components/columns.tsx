import { getColumnsProps } from "@/bindings"
import { Checkbox } from "@/components/ui/checkbox"
import type { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import SortingButton from "./sorting-btn"

export const generateColumnsDefs = async (
  tableName: string
): Promise<ColumnDef<any>[]> => {
  const columns = await getColumnsProps(tableName)
  const columnsDefinition: ColumnDef<any>[] = columns.map(
    ({ columnName, isPK, hasFkRelations }) => {
      const columnDefinition: ColumnDef<any> = {
        accessorKey: columnName,
        // types for `meta` come from env.d.ts
        meta: {
          name: columnName,
          hasFkRelations
        },
        header: ({ column }: { column: Column<any> }) => {
          return <SortingButton column={column} title={columnName} />
        }
      }
      columnDefinition.id = isPK
        ? "pk"
        : (columnDefinition.accessorKey as string)
      return columnDefinition
    }
  )

  appendCheckboxColumn(columnsDefinition)

  return columnsDefinition
}

// Appends an extra checkbox column at the beginning of all columns
const appendCheckboxColumn = (columns: ColumnDef<any>[]) => {
  columns.unshift({
    id: "select",
    header: ({ table }: { table: Table<any> }) => (
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
    cell: ({ row }: { row: Row<any> }) => {
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
