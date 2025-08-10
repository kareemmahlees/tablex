import { TableInfo } from "@/bindings"
import { createContext, useContext } from "react"

export const TableSchemaContext = createContext<TableInfo | null>(null)

export const useTableSchema = () => {
  const tableSchema = useContext(TableSchemaContext)

  if (!tableSchema)
    throw new Error(
      "useTableSchema must be used within TableSchemaContext provider."
    )

  return { ...tableSchema, pkCols: tableSchema.columns.filter((c) => c.pk) }
}
