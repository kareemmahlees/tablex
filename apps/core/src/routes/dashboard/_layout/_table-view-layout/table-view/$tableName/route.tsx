import { DataTable } from "@/components/custom/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getTableColumnsOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { useSetupReactTable } from "@/hooks/table"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/dashboard/_layout/_table-view-layout/table-view/$tableName"
)({
  loaderDeps: ({ search }) => ({ connectionId: search.connectionId }),
  loader: ({
    context: { queryClient },
    deps: { connectionId },
    params: { tableName }
  }) => {
    queryClient.ensureQueryData(getTablesQueryOptions(connectionId!))
    queryClient.ensureQueryData(getTableColumnsOptions(tableName))
  },
  component: TableView,
  pendingComponent: () => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-full" />
    </div>
  )
})

function TableView() {
  const { tableName } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const { connectionId } = Route.useSearch()
  const { data: columns } = useSuspenseQuery(getTableColumnsOptions(tableName))
  // const { updateTableName } = useTableState()
  // const [, setActiveTable] = useLocalStorage<TableLocalStorage | null>(
  //   `@tablex/${connectionId}`,
  //   null
  // )

  // useEffect(() => updateTableName(tableName), [tableName, updateTableName])
  // useEffect(
  //   () => setActiveTable({ tableName, pageIndex: 0 }),
  //   [setActiveTable, tableName]
  // )

  const { isRowsLoading, contextMenuRow, setContextMenuRow, table, tableRef } =
    useSetupReactTable({ columns, tableName, connectionId })

  useTauriEventListener(
    "tableContentsChanged",
    () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TABLE_ROWS] }),
    [queryClient]
  )

  if (isRowsLoading)
    return (
      <div className="flex h-full flex-col space-y-10">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full" />
      </div>
    )

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <DataTable table={table} />
      {/* <DataTable
        columns={columns!}
        connectionId={connectionId}
        tableName={tableName}
      /> */}
    </section>
  )
}
