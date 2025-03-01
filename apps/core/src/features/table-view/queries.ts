import { commands } from "@/bindings"
import { QUERY_KEYS } from "@/lib/constants"
import { unwrapResult } from "@/lib/utils"
import { queryOptions } from "@tanstack/react-query"

export const getTablesQueryOptions = queryOptions({
  queryKey: [QUERY_KEYS.GET_TABLES],
  queryFn: async () => unwrapResult(await commands.getTables())
})
