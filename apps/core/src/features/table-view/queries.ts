import { commands } from "@/bindings"
import { QUERY_KEYS } from "@/lib/constants"
import { queryOptions } from "@tanstack/react-query"

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
