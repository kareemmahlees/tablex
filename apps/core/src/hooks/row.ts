import { commands } from "@/bindings"
import { toast } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"

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
      const commandResult = await commands.getFkRelations(
        tableName,
        columnName,
        cellValue
      )
      if (commandResult.status === "error") {
        toast.error(commandResult.error, { id: "fk_relations" })
        return undefined
      }

      return commandResult.data
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
      const commandResult = await commands.getPaginatedRows(
        tableName,
        pageIndex,
        pageSize
      )

      if (commandResult.status === "error") {
        toast.error(commandResult.error, { id: "paginated_rows" })
        return undefined
      }

      return commandResult.data
    }
  })
}
