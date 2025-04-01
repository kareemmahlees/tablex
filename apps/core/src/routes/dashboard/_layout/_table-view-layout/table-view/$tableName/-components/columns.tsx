import { type ColumnProps, commands } from "@/bindings"
import { Checkbox } from "@/components/ui/checkbox"
import type { TableState } from "@/state/tableState"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./super-powered-column"

export const generateColumnsDefs = async (
  tableName: string,
  updatePkColumn: TableState["updatePkColumn"]
) => {
  const columns = await commands.getColumnsProps(tableName)

  const columnsDefinitions = columns.map(({ name, pk }) => {
    const columnDefinition: ColumnDef<ColumnProps> = {
      accessorKey: name,
      id: name,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={name} />
      },
      cell: (info) => {
        // Overcome the fact that tanstack table can't render boolean
        // values by default.
        const value =
          typeof info.getValue() === "boolean"
            ? String(info.getValue())
            : (info.getValue() as string)
        let cellContent = value
        // Clamp long text.
        if (value && value.length > 20) {
          cellContent = value.slice(0, 15) + "..."
        }
        return (
          <span className="flex items-center gap-x-2">
            {/* {hasFkRelations && (
                <ForeignKeyDropdown
                  tableName={tableName}
                  columnName={columnName}
                  cellValue={value}
                />
              )} */}

            {cellContent}
          </span>
        )
      }
    }
    if (pk) {
      updatePkColumn(name)
    }
    return columnDefinition
  })

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
