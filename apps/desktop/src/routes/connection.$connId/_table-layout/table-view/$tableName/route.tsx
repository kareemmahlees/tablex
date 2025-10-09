import { TooltipButton } from "@/components/custom/tooltip-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDBSchema } from "@/features/common/db-context"
import { generateColumnsDefs } from "@/features/table-view/columns"
import { AddRowSheet } from "@/features/table-view/components/create-row-sheet"
import { DeleteRowBtn } from "@/features/table-view/components/delete-row"
import EditRowSheet from "@/features/table-view/components/edit-row-sheet"
import {
  TableSchemaContext,
  useTableSchema
} from "@/features/table-view/context"
import { getPaginatedRowsOptions } from "@/features/table-view/queries"
import {
  filteringSchema,
  paginationSchema,
  sortingSchema
} from "@/features/table-view/schemas"
import { useSetupCodeMirror } from "@/hooks/use-setup-code-mirror"
import { useSetupDataTable } from "@/hooks/use-setup-data-table"
import { useTauriEventListener } from "@/hooks/use-tauri-event-listener"
import { QUERY_KEYS } from "@/lib/constants"
import { betterStyling } from "@/lib/editor-ext"
import { sql } from "@codemirror/lang-sql"
import sqlFormatter from "@sqltools/formatter"
import { cn } from "@tablex/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Row } from "@tanstack/react-table"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { z } from "zod"

export const Route = createFileRoute(
  "/connection/$connId/_table-layout/table-view/$tableName"
)({
  validateSearch: z.object({
    sorting: sortingSchema,
    pagination: paginationSchema,
    filtering: filteringSchema,
    view: z.enum(["data", "definition"]).default("data"),
    joinOperator: z.enum(["and", "or"]).default("and")
  }),
  component: TableView,
  pendingComponent: TableLoadingSkeleton
})

function TableView() {
  const { tableName } = Route.useParams()
  const dbSchema = useDBSchema()
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <TableSchemaContext.Provider
      value={dbSchema.find((t) => t.name === tableName)!}
    >
      <section className="flex h-full w-full flex-col overflow-auto will-change-scroll">
        {view === "data" ? <TableEditor /> : <TableDefinition />}
        <div
          className="bg-sidebar flex flex-row-reverse items-center justify-between p-4"
          id="table-footer"
        >
          <Tabs
            value={view}
            onValueChange={(value) =>
              navigate({
                to: ".",
                search: (prev) => ({
                  ...prev,
                  view: value as "data" | "definition"
                })
              })
            }
          >
            <TabsList>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="definition">Definition</TabsTrigger>
            </TabsList>
          </Tabs>
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
    </div>
  )
}

const TableDefinition = () => {
  const { tableSchema } = useTableSchema()

  const { editorRef } = useSetupCodeMirror({
    extensions: [
      sql({
        upperCaseKeywords: true
      }),
      betterStyling({ fontSize: 20 })
    ],
    theme: tokyoNight,
    value: sqlFormatter.format(tableSchema.create_statement, {
      reservedWordCase: "upper",
      indent: "\t"
    }),
    autoFocus: true,
    readOnly: true
  })

  return (
    <div
      ref={editorRef}
      style={{
        height: "100%",
        minHeight: 0
      }}
    />
  )
}

const TableEditor = () => {
  const { tableSchema } = useTableSchema()
  const [rowToEdit, setRowToEdit] = useState<Row<any> | undefined>(undefined)
  const { sorting, filtering, joinOperator, pagination, view } =
    Route.useSearch()
  const { tableName, connId } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const {
    data: rows,
    refetch: refetchRows,
    isFetching: isFetchingRows,
    isPending: isPendingRows,
    isError
  } = useQuery(
    getPaginatedRowsOptions({
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

  useTauriEventListener(
    "tableContentsChanged",
    () =>
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TABLE_ROWS, tableName]
      }),
    [queryClient]
  )

  const columns = useMemo(() => generateColumnsDefs(tableSchema), [tableSchema])
  const { table } = useSetupDataTable({
    columns,
    data: rows ?? { data: [], pageCount: 0 },
    pagination,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return
      navigate({
        to: ".",
        search: {
          sorting,
          pagination: updater(pagination),
          filtering,
          view,
          joinOperator
        }
      })
    }
  })

  if (isError) return <p>Something went wrong</p>

  return (
    <>
      {isPendingRows ? (
        <TableLoadingSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-x-3">
              <DataTableSortList
                table={table}
                sorting={sorting}
                onSortingChange={(data) =>
                  navigate({
                    to: ".",
                    search: (prev) => ({
                      ...prev,
                      sorting: data
                    })
                  })
                }
              />
              <DataTableFilterList
                table={table}
                filters={filtering}
                onFilterChange={(data) => {
                  navigate({
                    to: ".",
                    search: (prev) => ({
                      ...prev,
                      filtering: data
                    })
                  })
                }}
                joinOperator={joinOperator}
                onJoinOperatorChange={(data) =>
                  navigate({
                    to: ".",
                    search: (prev) => ({
                      ...prev,
                      joinOperator: data
                    })
                  })
                }
              />
              <DataTableViewOptions table={table} />
            </div>
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
          <DataTable table={table} onRowClick={(row) => setRowToEdit(row)} />
        </>
      )}
      {document.getElementById("table-footer") &&
        createPortal(
          isPendingRows ? (
            <Skeleton className="h-full w-1/3" />
          ) : (
            <DataTablePagination table={table} connectionId={connId} />
          ),
          document.getElementById("table-footer")!
        )}
    </>
  )
}
