import type { ColumnInfo, TableInfo } from "@/bindings"
import { DataTableColumnHeader } from "@/components/custom/data-table-column-header"
import MonacoEditor from "@/components/custom/monaco-editor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { ColumnDef } from "@tanstack/react-table"
import { Check, Minus } from "lucide-react"
import { z } from "zod"

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
                <MonacoEditor
                  defaultValue={JSON.stringify(value, undefined, 2)}
                  options={{
                    readOnly: true
                  }}
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
                <MonacoEditor
                  defaultLanguage="plaintext"
                  defaultValue={value}
                  options={{
                    lineNumbers: "off",
                    readOnly: true,
                    wordWrap: "wordWrapColumn",
                    wordWrapColumn: 50
                  }}
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
      }
    }
    // if (pk) {
    //   updatePkColumn(name)
    // }
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

export const getZodSchemaFromCols = (table: TableInfo) => {
  const schemaObject: z.ZodRawShape = {}

  table.columns.forEach((colProps) => {
    let validationRule: z.ZodTypeAny

    switch (colProps.type) {
      case "positiveInteger":
        validationRule = z.coerce
          .number({
            invalid_type_error: "Field must be a valid integer"
          })
          .positive({ message: "Field must be a positive integer" })
        break

      case "integer":
        validationRule = z.coerce.number({
          invalid_type_error: "Field must be a valid integer"
        })
        break

      case "float":
        validationRule = z
          .number()
          .int({ message: "Field must be a valid float" })
        break

      case "text":
        validationRule = z.string().refine(
          (val) => {
            // this is done because IPs fall into the isNaN check
            if (z.string().ip().safeParse(val).success) {
              return true
            }
            return isNaN(parseInt(val))
          },
          {
            message: "Field must be a valid string"
          }
        )
        break

      case "uuid":
        validationRule = z.string().uuid()
        break
      case "boolean":
        validationRule = z.boolean()
        break
      case "date":
      case "dateTime":
        validationRule = z.coerce.date()
        break
      case "json": {
        const jsonSchema = z.string().transform((str, ctx) => {
          try {
            return JSON.parse(str)
          } catch (e) {
            ctx.addIssue({ code: "custom", message: "Invalid JSON" })
            return z.NEVER
          }
        })
        validationRule = jsonSchema
        break
      }
      default:
        validationRule = z.any()
    }

    if (colProps.nullable || colProps.autoGenerated) {
      validationRule = validationRule.optional()
      // .refine((v) => (v === undefined ? null : v))
    }

    schemaObject[colProps.name] = validationRule
  })

  return z.object(schemaObject)
}
