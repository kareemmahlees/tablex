import { commands, GetRowsPayload } from "@/bindings"
import { QUERY_KEYS } from "@/lib/constants"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"

export const getTablesQueryOptions = (connectionId: string) =>
  queryOptions({
    queryKey: [QUERY_KEYS.GET_TABLES, connectionId],
    queryFn: async () => await commands.getTables()
  })

export const getConnectionDetailsQueryOptions = (connectionId: string) =>
  queryOptions({
    queryKey: [QUERY_KEYS.GET_CONNECTION_DETAILS, connectionId],
    queryFn: async () => await commands.getConnectionDetails(connectionId)
  })

export const getPaginatedRowsOptions = (data: GetRowsPayload) => {
  return queryOptions({
    queryKey: [QUERY_KEYS.TABLE_ROWS, data.tableName, { ...data }],
    queryFn: async () => await commands.getPaginatedRows(data),
    staleTime: 10 * 60 * 1000, // 30 mins
    placeholderData: keepPreviousData
  })
}
