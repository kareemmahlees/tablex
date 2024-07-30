import { commands } from "@/bindings"
import { getZodSchemaFromCols } from "@/commands/columns"
import { unwrapResult } from "@/lib/utils"
import { useQueries, useQuery } from "@tanstack/react-query"

/**
 * Returns foreign key rows related to a specific cell value.
 *
 * **Disabled by default** and you run it using `refetch`
 */
export const useGetFKRelations = (
  tableName: string,
  columnName: string,
  cellValue: any
) => {
  return useQuery({
    queryKey: ["fk_rows"],
    queryFn: async () => {
      const result = await commands.getFkRelations(
        tableName,
        columnName,
        cellValue
      )
      return unwrapResult(result)
    },
    enabled: false,
    placeholderData: [{ tableName: "", rows: [{ "": "" }] }]
  })
}

export const useGetPaginatedRows = (
  tableName: string,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: ["table_rows", tableName, { pageIndex, pageSize }],
    queryFn: async () => {
      const result = await commands.getPaginatedRows(
        tableName,
        pageIndex,
        pageSize
      )

      return unwrapResult(result)
    }
  })
}

/**
 * Performs two parallel queries to get data about the table's columns:
 *
 * 1- Get's a generated zod schema from the table columns.
 *
 * 1- Get's some info about the column props like data type, name, default value, etc...
 */
export const useGetGeneralColsData = (tableName: string) => {
  return useQueries({
    queries: [
      {
        queryKey: ["zod_schema", tableName],
        queryFn: async () => await getZodSchemaFromCols(tableName)
      },
      {
        queryKey: ["columns_props", tableName],
        queryFn: async () =>
          unwrapResult(await commands.getColumnsProps(tableName))
      }
    ]
  })
}
