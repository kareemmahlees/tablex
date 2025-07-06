import { commands, RowRecord } from "@/bindings"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
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
  "/connection/$connId/_table-layout/table-view/$tableName"
)({
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
  const { tableName, connId } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const { pagination, setPagination } = useSetupPagination(connId)
  const {
    "0": { data: tableSchema },
    "1": { data: rows, refetch: refetchRows, isFetching: isFetchingRows }
  } = useSuspenseQueries({
    queries: [
      discoverDBSchemaOptions(tableName),
      getPaginatedRowsOptions({
        tableName,
        ...pagination
      })
    ]
  })
  const columns = useMemo(() => generateColumnsDefs(tableSchema), [tableSchema])
  const { table } = useSetupDataTable({
    columns,
    data: rows,
    pagination,
    setPagination
  })

  useTauriEventListener(
    "tableContentsChanged",
    () =>
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TABLE_ROWS, tableName]
      }),
    [queryClient]
  )

  useHotkeys("delete", async () => {
    const pkCols = tableSchema.columns.filter((c) => c.pk)
    if (pkCols.length === 0)
      return toast.warning("No primary key defined for this table.")

    const rowsToDelete: RowRecord[][] = table
      .getSelectedRowModel()
      .flatRows.map((r) =>
        pkCols.map((col) => ({
          columnName: col.name,
          value: r.getValue(col.name),
          columnType: col.type
        }))
      )
    toast.promise(commands.deleteRows(rowsToDelete, tableName), {
      success: () => {
        table.toggleAllRowsSelected(false)
        return `Successfully deleted ${rowsToDelete.length} row(s).`
      },
      error: (err) => {
        return "Something went wrong."
      }
    })
  })

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-x-3">
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <DataTable table={table} />
      <div className="bg-sidebar flex items-center justify-between p-4">
        <DataTablePagination table={table} connectionId={connId} />
        <div className="space-x-4">
          <TooltipButton
            size={"icon"}
            variant={"secondary"}
            className={cn("h-8 w-8", isFetchingRows && "animate-spin")}
            tooltipContent="Refresh"
            disabled={isFetchingRows}
            onClick={async () => await refetchRows()}
          >
            <RefreshCw className="size-4" />
          </TooltipButton>
          <AddRowSheet tableName={tableName} />
        </div>
      </div>
    </section>
  )
}
