import { getFkRelations } from "@/commands/row"
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
    queryFn: async () => await getFkRelations(tableName, columnName, cellValue),
    enabled: false,
    placeholderData: [{ tableName: "", rows: [{ "": "" }] }]
  })
}
