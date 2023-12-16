import { Checkbox } from "@/components/ui/checkbox"
import type { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { getColsDefinitions } from "../../actions"
import SortingButton from "./sorting-btn"

export const generateColumnsDefs = async (
  tableName: string
): Promise<ColumnDef<any>[]> => {
  const columns = await getColsDefinitions(tableName)
  let columnsDefinition: ColumnDef<any>[]

  columnsDefinition = Object.entries(columns).map(([colName, colProps]) => {
    const columnDefinition: ColumnDef<any> = {
      accessorKey: colName,
      //types for `meta` come from env.d.ts
      meta: {
        name: colName
      },
      header: ({ column }: { column: Column<any> }) => {
        return <SortingButton column={column} title={colName} />
      }
    }
    if (colProps.pk) columnDefinition.id = "pk"
    return columnDefinition
  })

  // add the select box column in the beginning of columns
  columnsDefinition.unshift({
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
  return columnsDefinition
}
