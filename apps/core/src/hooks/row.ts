import { commands } from "@/bindings"
import { useQuery } from "@tanstack/react-query"
import { unwrapResult } from "@tablex/lib/utils"

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
