import { commands } from "@/bindings"
import { unwrapResult } from "@/lib/utils"
import { z } from "zod"

export const getZodSchemaFromCols = async (tableName: string) => {
  const result = await commands.getColumnsProps(tableName)
  const cols = unwrapResult(result)
  if (cols === false) return

  const schemaObject: z.ZodRawShape = {}

  cols.forEach((colProps) => {
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
        const literalSchema = z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.null()
        ])
        type Literal = z.infer<typeof literalSchema>
        type Json = Literal | { [key: string]: Json } | Json[]
        const jsonSchema: z.ZodType<Json> = z.lazy(() =>
          z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
        )
        validationRule = jsonSchema
        break
      }
      default:
        validationRule = z.any()
    }

    if (colProps.isNullable || colProps.isAutoIncrement) {
      validationRule = validationRule.optional()
    }

    schemaObject[colProps.columnName] = validationRule
  })

  return z.object(schemaObject)
}
