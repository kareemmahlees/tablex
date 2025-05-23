import type { ColumnInfo, TableInfo } from "@/bindings"
import { DataTableColumnHeader } from "@/components/custom/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

export const generateColumnsDefs = (
  table: TableInfo
  // updatePkColumn: TableState["updatePkColumn"]
) => {
  const columnsDefinitions = table.columns.map(({ name, pk }) => {
    const columnDefinition: ColumnDef<ColumnInfo> = {
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
          .refine(
            (n) => !z.number().int().safeParse(n).success,
            "Field must be a valid float"
          )
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

    if (colProps.nullable) {
      validationRule = validationRule.optional()
    }

    schemaObject[colProps.name] = validationRule
  })

  return z.object(schemaObject)
}
