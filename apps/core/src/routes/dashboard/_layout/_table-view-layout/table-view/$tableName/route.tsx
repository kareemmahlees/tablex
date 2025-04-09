import { DataTable } from "@/components/custom/data-table"
import { DataTablePagination } from "@/components/custom/data-table-pagination"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getPaginatedRowsOptions,
  getTableColumnsOptions
} from "@/features/table-view/queries"
import { useSetupReactTable } from "@/hooks/table"
import { useSetupPagination } from "@/hooks/use-setup-pagination"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { cn } from "@tablex/lib/utils"
import { useSuspenseQueries } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PlusCircle, RefreshCw } from "lucide-react"

export const Route = createFileRoute(
  "/dashboard/_layout/_table-view-layout/table-view/$tableName"
)({
  loaderDeps: ({ search }) => ({ connectionId: search.connectionId }),
  loader: ({ context: { queryClient }, params: { tableName } }) => {
    queryClient.ensureQueryData(getTableColumnsOptions(tableName))
  },
  component: TableView,
  pendingComponent: () => (
    <div className="flex h-full flex-col space-y-5 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-full" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  )
})

function TableView() {
  const { tableName } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const { connectionId } = Route.useSearch()
  const { pagination, setPagination } = useSetupPagination(connectionId!)
  const {
    "0": { data: columns },
    "1": { data: rows, refetch: refetchRows, isFetching: isFetchingRows }
  } = useSuspenseQueries({
    queries: [
      getTableColumnsOptions(tableName),
      getPaginatedRowsOptions({
        tableName,
        ...pagination
      })
    ]
  })

  const { table } = useSetupReactTable({
    columns,
    data: rows,
    pagination,
    setPagination
  })

  useTauriEventListener(
    "tableContentsChanged",
    () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TABLE_ROWS] }),
    [queryClient]
  )

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <DataTable table={table} />
      <div className="flex items-center justify-between p-4">
        <DataTablePagination table={table} />
        <div className="space-x-4">
          <TooltipButton
            size={"icon"}
            variant={"secondary"}
            className={cn("h-8 w-8", isFetchingRows && "animate-spin")}
            tooltipContent="Refresh"
            disabled={isFetchingRows}
            onClick={async () => await refetchRows()}
          >
            <RefreshCw className="h-4 w-4" />
          </TooltipButton>
          <TooltipButton
            size={"icon"}
            className="h-8 w-8"
            tooltipContent="Add Row"
          >
            <PlusCircle className="h-4 w-4" />
          </TooltipButton>
        </div>
      </div>
    </section>
  )
}
