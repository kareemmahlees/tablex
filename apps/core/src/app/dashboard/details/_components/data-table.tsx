"use client"

import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type Table as TableType
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { Sheet } from "@/components/ui/sheet"
import { useQueryClient, type QueryClient } from "@tanstack/react-query"
import { unregister } from "@tauri-apps/api/globalShortcut"
import { useSearchParams } from "next/navigation"
import {
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from "react"
import {
  copyRowIntoClipboard,
  deleteRows,
  registerCopyShortcut,
  registerDeleteShortcut,
  registerSelectAllShortcut
} from "../actions"
import EditRowSheet from "./edit-row-sheet"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const DataTable = <TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) => {
  const tableName = useSearchParams().get("tableName")!
  const queryClient = useQueryClient()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [contextMenuRow, setContextMenuRow] = useState<Row<any>>()
  const tableRef = useRef<HTMLTableElement>(null)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection
    }
  })
  useLayoutEffect(() => {
    unregister("Delete").then(() => {
      registerDeleteShortcut(table, tableName, queryClient)
    })
    unregister("CommandOrControl+A").then(() =>
      registerSelectAllShortcut(table)
    )
    unregister("CommandOrControl+C").then(() =>
      registerCopyShortcut(table, contextMenuRow)
    )
  })

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <ContextMenu>
        <Table className="text-xs lg:text-sm" ref={tableRef}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="sticky top-0 backdrop-blur-md "
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-bold text-sm lg:text-base"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <ContextMenuTrigger asChild>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => row.toggleSelected(!row.getIsSelected())}
                    className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
                    onContextMenu={() => setContextMenuRow(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
              <TableContextMenuContent
                tableName={tableName}
                table={table}
                setIsSheetOpen={setIsSheetOpen}
                queryClient={queryClient}
                contextMenuRow={contextMenuRow!}
              />
            </TableBody>
          </ContextMenuTrigger>
        </Table>
      </ContextMenu>
      {
        // because initially, contextMenuRow is null and the component can't be rendered
        contextMenuRow && (
          <EditRowSheet
            setIsSheetOpen={setIsSheetOpen}
            row={contextMenuRow}
            table={table}
          />
        )
      }
    </Sheet>
  )
}

export default DataTable

interface TableContextMenuContentProps {
  table: TableType<any>
  contextMenuRow: Row<any>
  tableName: string
  queryClient: QueryClient
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

const TableContextMenuContent = ({
  table,
  tableName,
  queryClient,
  setIsSheetOpen,
  contextMenuRow
}: TableContextMenuContentProps) => {
  return (
    <ContextMenuContent
      className="bg-transparent backdrop-blur-md"
      data-side="bottom"
    >
      <ContextMenuItem
        onSelect={async () => await deleteRows(table, tableName, queryClient)}
      >
        Delete
        <ContextMenuShortcut>Delete</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIsSheetOpen(true)}>
        Edit
      </ContextMenuItem>
      <ContextMenuItem
        onClick={async () => await copyRowIntoClipboard(table, contextMenuRow)}
      >
        Copy
        <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
