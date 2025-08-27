import { TableInfo } from "@/bindings"
import { createContext, useContext } from "react"

export const DBSchemaContext = createContext<TableInfo[] | null>(null)

export const useDBSchema = () => {
  const dbSchema = useContext(DBSchemaContext)

  if (!dbSchema)
    throw new Error(
      "useTableSchema must be used within TableSchemaContext provider."
    )

  return dbSchema
}
