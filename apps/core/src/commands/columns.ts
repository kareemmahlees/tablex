import { commands } from "@/bindings"
import {
  DATE_DATA_TYPES,
  NUMERIC_DATA_TYPE,
  STRING_DATA_TYPES
} from "@tablex/lib/constants"
import toast from "react-hot-toast"
import { z } from "zod"

export const getZodSchemaFromCols = async (tableName: string) => {
  const cols = await commands.getColumnsProps(tableName)
  if (cols.status === "error") {
    return toast.error(cols.error, { id: "get_columns_props" })
  }
  const schemaObject: z.ZodRawShape = {}
  cols.data.forEach((colProps) => {
    let validationRule: z.ZodTypeAny

    switch (true) {
      case NUMERIC_DATA_TYPE.includes(colProps.type) ||
        new RegExp("float\\(\\d+.\\d+\\)").test(colProps.type):
        validationRule = z.coerce.number({
          invalid_type_error: "Field must be number"
        })
        break
      case STRING_DATA_TYPES.includes(colProps.type) ||
        new RegExp("VARCHAR\\(\\d+\\)").test(colProps.type):
        // this is done to overcome the fact that input values are always string
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
      // only valid in postgres
      case colProps.type == "uuid":
        validationRule = z.string().uuid()
        break
      case colProps.type == "boolean":
        validationRule = z.boolean()
        break
      case DATE_DATA_TYPES.includes(colProps.type):
        validationRule = z.date()
        break
      default:
        validationRule = z.any()
    }

    if (colProps.isNullable) {
      validationRule = validationRule.optional()
    }

    schemaObject[colProps.columnName] = validationRule
  })

  return z.object(schemaObject)
}
