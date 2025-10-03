import { commands, GetRowsPayload } from "@/bindings"
import { QUERY_KEYS } from "@/lib/constants"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"

export const getPaginatedRowsOptions = (data: GetRowsPayload) => {
  return queryOptions({
    queryKey: [QUERY_KEYS.TABLE_ROWS, data.tableName, { ...data }],
    queryFn: async () => await commands.getPaginatedRows(data),
    staleTime: 10 * 60 * 1000, // 30 mins
    placeholderData: keepPreviousData
  })
}
