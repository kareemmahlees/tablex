import { DataTable } from "@/components/custom/data-table"
import { DataTablePagination } from "@/components/custom/data-table-pagination"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { Skeleton } from "@/components/ui/skeleton"
import { generateColumnsDefs } from "@/features/table-view/columns"
import { AddRowSheet } from "@/features/table-view/components/create-row-sheet"
import {
  discoverDBSchemaOptions,
  getPaginatedRowsOptions
} from "@/features/table-view/queries"
import { useSetupDataTable } from "@/hooks/use-setup-data-table"
import { useSetupPagination } from "@/hooks/use-setup-pagination"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { cn } from "@tablex/lib/utils"
import { useSuspenseQueries } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/dashboard/_layout/_table-view-layout/table-view/$tableName"
)({
  loaderDeps: ({ search }) => ({ connectionId: search.connectionId }),
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
      {
        ...discoverDBSchemaOptions(tableName),
        select: generateColumnsDefs
      },
      getPaginatedRowsOptions({
        tableName,
        ...pagination
      })
    ]
  })
  const pkCols = useMemo(
    () =>
      columns.filter((col) => col.meta?.isPk && col.id).map((col) => col.id!),
    [columns]
  )

  const { table } = useSetupDataTable({
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

  useHotkeys("delete", async () => {
    if (pkCols.length === 0)
      return toast.warning("No primary key defined for this table.")

    const rr = table
      .getSelectedRowModel()
      .flatRows.map((r) => pkCols.map((colId) => r.getValue(colId)))
  })

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <DataTable table={table} />
      <div className="bg-sidebar flex items-center justify-between p-4">
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
          <AddRowSheet tableName={tableName} />
        </div>
      </div>
    </section>
  )
}
