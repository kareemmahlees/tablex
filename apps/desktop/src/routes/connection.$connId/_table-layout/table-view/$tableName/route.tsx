import { TooltipButton } from "@/components/custom/tooltip-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Skeleton } from "@/components/ui/skeleton"
import { useDBSchema } from "@/features/common/db-context"
import { generateColumnsDefs } from "@/features/table-view/columns"
import { AddRowSheet } from "@/features/table-view/components/create-row-sheet"
import { DeleteRowBtn } from "@/features/table-view/components/delete-row"
import EditRowSheet from "@/features/table-view/components/edit-row-sheet"
import { TableSchemaContext } from "@/features/table-view/context"
import { getPaginatedRowsOptions } from "@/features/table-view/queries"
import {
  filteringSchema,
  paginationSchema,
  sortingSchema
} from "@/features/table-view/schemas"
import { useSetupDataTable } from "@/hooks/use-setup-data-table"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { cn } from "@tablex/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Row } from "@tanstack/react-table"
import { RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
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

function TableView() {
  const { tableName, connId } = Route.useParams()
  const dbSchema = useDBSchema()
  const tableSchema = useMemo(
    () => dbSchema.find((t) => t.name === tableName)!,
    [dbSchema]
  )
  console.log(tableSchema)
  const { sorting, pagination, filtering, joinOperator } = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const [rowToEdit, setRowToEdit] = useState<Row<any> | undefined>(undefined)
  const {
    data: rows,
    refetch: refetchRows,
    isFetching: isFetchingRows
  } = useSuspenseQuery(
    getPaginatedRowsOptions({
      columns: tableSchema.columns.map((c) => ({
        columnName: c.name,
        columnType: typeof c.type === "object" ? { enum: c.type.enum } : c.type
      })),
      tableName,
      pagination,
      sorting,
      filtering: filtering.map((f) => {
        if (f.operator === "isEmpty" || f.operator === "isNotEmpty")
          return {
            column: f.column,
            filters: f.operator
          }

        return {
          column: f.column,
          filters: {
            [f.operator]: f.value
          }
        }
      })
    })
  )
  const columns = useMemo(() => generateColumnsDefs(tableSchema), [tableSchema])
  const { table } = useSetupDataTable({
    columns,
    data: rows,
    pagination,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return
      navigate({
        to: ".",
        search: {
          sorting,
          pagination: updater(pagination),
          filtering,
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

  return (
    <TableSchemaContext.Provider
      value={dbSchema.find((t) => t.name === tableName)!}
    >
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
              onFilterChange={(data) => {
                navigate({
                  to: ".",
                  search: {
                    sorting,
                    pagination,
                    filtering: data,
                    joinOperator
                  }
                })
              }}
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
        <DataTable table={table} onRowClick={(row) => setRowToEdit(row)} />
        <div className="bg-sidebar flex items-center justify-between p-4">
          <DataTablePagination table={table} connectionId={connId} />
          <div className="space-x-4">
            <DeleteRowBtn table={table} />
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
            <AddRowSheet />
            <EditRowSheet row={rowToEdit} setRow={setRowToEdit} />
          </div>
        </div>
      </section>
    </TableSchemaContext.Provider>
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
