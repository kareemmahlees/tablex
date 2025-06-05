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

export const discoverDBSchemaOptions = (tableName: string) =>
  queryOptions({
    queryKey: [QUERY_KEYS.DB_SCHEMA, tableName],
    queryFn: async () => {
      const schema = await commands.discoverDbSchema()
      return schema.find((t) => t.name === tableName)!
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  })

export const getPaginatedRowsOptions = ({
  tableName,
  pageIndex,
  pageSize
}: {
  tableName: string
  pageIndex: number
  pageSize: number
}) => {
  return queryOptions({
    queryKey: [QUERY_KEYS.TABLE_ROWS, tableName, { pageIndex, pageSize }],
    queryFn: async () =>
      await commands.getPaginatedRows(tableName, pageIndex, pageSize),
    staleTime: 10 * 60 * 1000 // 30 mins
  })
}
