import { useRouteContext, useSearch } from "@tanstack/react-router"
import { getZodSchemaFromCols } from "./columns"

export const useTableSchema = () => {
  const { schema } = useRouteContext({ from: "/connection/$connId/editor" })
  const { table } = useSearch({ from: "/connection/$connId/editor", select: s => ({ table: s.table }) })
  const tableSchema = schema.find(s => s.name === table)

  if (!schema || !tableSchema)
    throw new Error(
      "useTableSchema must be used within the table editor route context"
    )

  return {
    tableSchema,
    pkCols: tableSchema.columns.filter((c) => c.pk),
    zodSchema: getZodSchemaFromCols(tableSchema)
  }
}
