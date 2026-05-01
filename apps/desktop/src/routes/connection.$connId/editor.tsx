import { commands } from "@/bindings"
import { TooltipButton } from "@/components/custom/tooltip-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import {
  DataTablePagination,
  DataTableViewOptions
} from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { generateColumnsDefs } from "@/features/table-view/columns"
import { AddRowSheet } from "@/features/table-view/components/create-row-sheet"
import EditRowSheet from "@/features/table-view/components/edit-row-sheet"
import { SelectedRowsActions } from "@/features/table-view/components/selected-rows-actions"
import { useTableSchema } from "@/features/table-view/hooks"
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
import { DotmTriangle5 } from "@tablex/ui/components/dotm-triangle-5"
import { Input } from "@tablex/ui/components/input"
import { ScrollArea } from "@tablex/ui/components/scroll-area"
import {
  Select,
  SelectTrigger,
  SelectValue
} from "@tablex/ui/components/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@tablex/ui/components/sidebar"
import { Skeleton } from "@tablex/ui/components/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@tablex/ui/components/tabs"
import { cn } from "@tablex/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Table } from "@tanstack/react-table"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import z from "zod"

export const Route = createFileRoute("/connection/$connId/editor")({
  beforeLoad: async () => {
    const schema = await commands.discoverDbSchema()
    return { schema }
  },
  validateSearch: z.object({
    schema: z.string().optional(),
    table: z.string().optional(),
    sorting: sortingSchema,
    pagination: paginationSchema,
    filtering: filteringSchema,
    joinOperator: z.enum(["and", "or"]).default("and")
  }),
  component: RouteComponent
})

function RouteComponent() {
  const { schema } = Route.useRouteContext()
  const table = Route.useSearch({ select: (s) => s.table })

  return (
    <SidebarProvider className="min-w-0">
      <Sidebar className="relative">
        <SidebarContent className="flex h-full flex-col">
          <SidebarGroup className="space-y-3">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose schema" />
              </SelectTrigger>
            </Select>
            <Input placeholder="Search for tables" />
          </SidebarGroup>

          <ScrollArea className="min-h-0 flex-1" type="always">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {schema.map((t) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          to="."
                          search={(prev) => ({ ...prev, table: t.name })}
                        >
                          {t.name}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <main className="min-h-0 min-w-0 flex-1">
        {!table ? <NoTableSelected /> : <TableView />}
      </main>
    </SidebarProvider>
  )
}

const NoTableSelected = () => {
  return (
    <div className="wrap-break-word flex h-full w-full flex-1 flex-col items-center justify-center gap-y-3 text-center text-2xl font-bold text-gray-500 opacity-50">
      <img src={"/icons/cube.svg"} alt="cube" width={100} height={100} />
      Choose a table
      <br />
      to get started
    </div>
  )
}

function TableView() {
  return (
    <Tabs
      defaultValue="data"
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-auto will-change-scroll"
    >
      <TabsContent value="data" className="w-full flex-1">
        <TableEditor />
      </TabsContent>
      <TabsContent
        value="definition"
        className="w-full min-w-0 flex-1 overflow-hidden"
      >
        <TableDefinition />
      </TabsContent>
      <div
        className="bg-sidebar flex flex-row-reverse items-center justify-between p-4"
        id="table-footer"
      >
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="definition">Definition</TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
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
        minHeight: 0,
        minWidth: 0,
        overflow: "auto"
      }}
    />
  )
}

const TableEditor = () => {
  const { tableSchema } = useTableSchema()
  const { sorting, filtering, joinOperator, pagination, table } =
    Route.useSearch()
  const { connId } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const [rowToEdit, setRowToEdit] = useState()

  const {
    data: rows,
    refetch: refetchRows,
    isFetching: isFetchingRows,
    isPending: isPendingRows,
    isError
  } = useQuery(
    getPaginatedRowsOptions({
      tableName: table!,
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
        queryKey: [QUERY_KEYS.TABLE_ROWS, table]
      }),
    [queryClient]
  )

  const columns = useMemo(() => generateColumnsDefs(tableSchema), [tableSchema])
  const { table: reactTable } = useSetupDataTable({
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
          joinOperator
        }
      })
    }
  })

  if (isError) return <p>Something went wrong</p>

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2.5">
        {reactTable.getSelectedRowModel().rows.length === 0 ? (
          <TableActions table={reactTable} disabled={isPendingRows} />
        ) : (
          <SelectedRowsActions table={reactTable} />
        )}
        <div className="space-x-4">
          <TooltipButton
            size={"icon"}
            variant={"secondary"}
            className={cn("h-8 w-8")}
            tooltipContent="Refresh"
            disabled={isFetchingRows}
            onClick={async () => await refetchRows()}
          >
            <RefreshCw
              className={cn("size-4", isFetchingRows && "animate-spin")}
            />
          </TooltipButton>
          <AddRowSheet />
          <EditRowSheet row={rowToEdit} setRow={setRowToEdit} />
        </div>
      </div>

      {isPendingRows ? (
        <div className="flex h-full w-full items-center justify-center">
          <DotmTriangle5 size={80} dotSize={10} />
        </div>
      ) : (
        <DataTable table={reactTable} onRowClick={(row) => setRowToEdit(row)} />
      )}
      {document.getElementById("table-footer") &&
        createPortal(
          isPendingRows ? (
            <Skeleton className="h-full w-1/3" />
          ) : (
            <DataTablePagination table={reactTable} connectionId={connId} />
          ),
          document.getElementById("table-footer")!
        )}
    </>
  )
}

const TableActions = ({
  table,
  disabled
}: {
  table: Table<any>
  disabled?: boolean
}) => {
  const { sorting, filtering, joinOperator } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <div className="flex items-center gap-x-3">
      <DataTableSortList
        table={table}
        sorting={sorting}
        disabled={disabled}
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
        disabled={disabled}
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
      <DataTableViewOptions table={table} disabled={disabled} />
    </div>
  )
}
