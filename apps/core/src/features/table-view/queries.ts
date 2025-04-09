import { commands } from "@/bindings"
import { generateColumnsDefs } from "@/features/table-view/columns"
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

export const getTableColumnsOptions = (tableName: string) =>
  queryOptions({
    queryKey: [QUERY_KEYS.TABLE_COLUMNS, tableName],
    queryFn: async () => await generateColumnsDefs(tableName),
    staleTime: 60 * 60 * 1000 // 1 hour
  })

// export const getPaginatedRowsOptions = ()=> queryOptions({
//       queryKey: ["table_rows", tableName, { pageIndex, pageSize }],
//     queryFn: async () => {
//       const result = await commands.getPaginatedRows(
//         tableName,
//         pageIndex,
//         pageSize
//       )

//       console.log("result", result)

//       return result
//     }
// })
