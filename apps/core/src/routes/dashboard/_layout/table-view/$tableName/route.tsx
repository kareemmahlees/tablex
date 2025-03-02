import LoadingSpinner from "@/components/loading-spinner"
import { getTablesQueryOptions } from "@/features/shared/queries"
import { useGetTableColumns } from "@/hooks/table"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import DataTable from "./-components/data-table"

export const Route = createFileRoute(
  "/dashboard/_layout/table-view/$tableName"
)({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getTablesQueryOptions),
  component: TableView
})

function TableView() {
  const { tableName } = Route.useParams()
  const { connectionId } = Route.useSearch()
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

  const {
    data: columns,
    isPending: isColumnsPending,
    isError,
    error
  } = useGetTableColumns(tableName)

  if (isColumnsPending) return <LoadingSpinner />

  if (isError) return toast.error(error.message, { id: "get_table_columns" })

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <DataTable columns={columns!} connectionId={connectionId} />
    </section>
  )
}
