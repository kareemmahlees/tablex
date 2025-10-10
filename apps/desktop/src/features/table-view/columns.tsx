import type { ColumnInfo, CustomColumnType, TableInfo } from "@/bindings"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { zodJsonValidation } from "@/lib/utils"
import { json } from "@codemirror/lang-json"
import "@tanstack/react-table"
import type { ColumnDef, RowData } from "@tanstack/react-table"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { Check, Minus } from "lucide-react"
import { z } from "zod"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type: CustomColumnType
  }
}

export const generateColumnsDefs = (table: TableInfo) => {
  const columnsDefinitions = table.columns.map(({ name, type }) => {
    const columnDefinition: ColumnDef<ColumnInfo> = {
      accessorKey: name,
      id: name,
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={name} />
      },
      cell: (info) => {
        let value = info.getValue<string | undefined>()

        if (type === "json" && value !== null) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size={"sm"} className="h-6 px-4 text-xs font-semibold">
                  JSON
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]" align="end">
                <CodeMirror
                  id="editor"
                  value={JSON.stringify(value, undefined, 2)}
                  theme={tokyoNight}
                  basicSetup={false}
                  extensions={[json()]}
                  readOnly
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        if (type === "text" && value !== null) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  size={"sm"}
                  className="h-6 bg-gray-100 px-4 text-xs font-semibold"
                >
                  TEXT
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]" align="end">
                <CodeMirror
                  id="editor"
                  value={value}
                  theme={tokyoNight}
                  basicSetup={false}
                  extensions={[EditorView.lineWrapping]}
                  readOnly
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        if (type === "boolean" && value !== null) {
          value = String(value)
        }

        if ((type === "binary" || type === "unSupported") && value !== null) {
          return (
            <Button
              size={"sm"}
              className="h-6 px-4 text-xs font-semibold"
              disabled
            >
              UnSupported
            </Button>
          )
        }

        return (
          <span className="flex items-center gap-x-2 whitespace-nowrap">
            {/* {hasFkRelations && (
                <ForeignKeyDropdown
                  tableName={tableName}
                  columnName={columnName}
                  cellValue={value}
                />
              )} */}

            {value}
          </span>
        )
      },
      enableColumnFilter:
        type !== "json" &&
        type !== "binary" &&
        type !== "custom" &&
        type !== "unSupported",
      meta: {
        type
      }
    }

    if (typeof type === "object") {
      columnDefinition.meta!.options = type.enum.variants.map((t) => ({
        label: t,
        value: t
      }))
    }

    return columnDefinition
  })

  appendCheckboxColumn(columnsDefinitions)

  return columnsDefinitions
}

// Appends an extra checkbox column at the beginning of all columns
const appendCheckboxColumn = (columns: ColumnDef<ColumnInfo>[]) => {
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
      >
        {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
          <Minus className="size-4" />
        ) : (
          <Check className="size-4" />
        )}
      </Checkbox>
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

export const getZodSchemaFromCols = (tableSchema: TableInfo) => {
  const schemaObject = z.object()

  tableSchema.columns.forEach((colProps) => {
    let validationRule: z.ZodTypeAny

    switch (colProps.type) {
      case "positiveInteger":
        validationRule = z.coerce
          .number({
            error: "Field must be a valid integer"
          })
          .positive({ message: "Field must be a positive integer" })
        break

      case "integer":
        validationRule = z.coerce.number({
          error: "Field must be a valid integer"
        })
        break

      case "float":
        validationRule = z
          .number()
          .int({ message: "Field must be a valid float" })
        break

      case "text":
        validationRule = z.union([z.ipv4(), z.ipv6(), z.string()], {
          error: "Field must be a valid string"
        })
        break

      case "uuid":
        validationRule = z.uuid()
        break
      case "boolean":
        validationRule = z.boolean()
        break
      case "date":
      case "dateTime":
        validationRule = z.coerce.date()
        break
      case "json": {
        validationRule = zodJsonValidation()
        break
      }
      default:
        validationRule = z.any()
    }

    if (colProps.nullable || colProps.autoGenerated) {
      validationRule = validationRule.optional()
    }

    schemaObject[colProps.name] = validationRule
  })

  return z.object(schemaObject)
}
