import { commands, RowRecord } from "@/bindings"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Skeleton } from "@/components/ui/skeleton"
import { generateColumnsDefs } from "@/features/table-view/columns"
import { AddRowSheet } from "@/features/table-view/components/create-row-sheet"
import {
  discoverDBSchemaOptions,
  getPaginatedRowsOptions
} from "@/features/table-view/queries"
import {
  filteringSchema,
  paginationSchema,
  sortingSchema
} from "@/features/table-view/schemas"
import { useSetupDataTable } from "@/hooks/use-setup-data-table"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { cn } from "@tablex/lib/utils"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute(
  "/connection/$connId/_table-layout/table-view/$tableName"
)({
  validateSearch: z.object({
    sorting: sortingSchema,
    pagination: paginationSchema,
    filtering: filteringSchema,
    joinOperator: z.enum(["and", "or"])
  }),
  component: TableView,
  pendingComponent: TableLoadingSkeleton
})

const FALLBACK_DATA = { pageCount: 0, data: [] }

function TableView() {
  const { tableName, connId } = Route.useParams()
  const { sorting, pagination, filtering, joinOperator } = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const { data: tableSchema } = useSuspenseQuery(
    discoverDBSchemaOptions(tableName)
  )
  const {
    data: rows,
    refetch: refetchRows,
    isFetching: isFetchingRows,
    isPending: isRowsPending
  } = useQuery(
    getPaginatedRowsOptions({
      tableName,
      pagination,
      sorting,
      filtering: [
        {
          column: "",
          filters: { gt: 1 }
        }
      ]
    })
  )
  const columns = useMemo(() => generateColumnsDefs(tableSchema), [tableSchema])
  const { table } = useSetupDataTable({
    columns,
    data: rows ?? FALLBACK_DATA,
    pagination,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return
      navigate({
        to: ".",
        search: {
          sorting,
          pagination: updater(pagination),
          filtering: [],
          joinOperator
        }
      })
    }
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

  if (isRowsPending) return <TableLoadingSkeleton />

  return (
    <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-x-3">
          <DataTableSortList
            table={table}
            sorting={sorting}
            onSortingChange={(data) =>
              navigate({
                to: ".",
                search: {
                  sorting: data,
                  pagination,
                  filtering,
                  joinOperator
                }
              })
            }
          />
          <DataTableFilterList
            table={table}
            filters={filtering}
            onFilterChange={(data) =>
              navigate({
                to: ".",
                search: {
                  sorting,
                  pagination,
                  filtering: data,
                  joinOperator
                }
              })
            }
            joinOperator={joinOperator}
            onJoinOperatorChange={(data) =>
              navigate({
                to: ".",
                search: {
                  sorting,
                  pagination,
                  filtering,
                  joinOperator: data
                }
              })
            }
          />
        </div>
        <DataTableViewOptions table={table} />
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

function TableLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col space-y-5 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-full" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  )
}
