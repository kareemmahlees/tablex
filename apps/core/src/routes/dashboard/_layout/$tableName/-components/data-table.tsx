"use client"

import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TableType
} from "@tanstack/react-table"

import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from "@/components/ui/pagination"

import { copyRowIntoClipboard, deleteRows } from "@/commands/row"
import LoadingSpinner from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { Sheet } from "@/components/ui/sheet"
import { useSetupReactTable } from "@/hooks/table"
import { registerShortcuts } from "@/shortcuts"
import { useQueryClient } from "@tanstack/react-query"
import { Router, useRouter } from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import {
  useLayoutEffect,
  useRef,
  type Dispatch,
  type SetStateAction
} from "react"
import EditRowSheet from "./edit-row-sheet"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  tableName: string
}

const DataTable = <TData, TValue>({
  columns,
  tableName
}: DataTableProps<TData, TValue>) => {
  const {
    isRowsLoading,
    isSheetOpen,
    setIsSheetOpen,
    contextMenuRow,
    setContextMenuRow,
    table,
    tableRef
  } = useSetupReactTable({ columns, tableName })
  const router = useRouter()
  const queryClient = useQueryClient()

  const { rows } = table.getRowModel()

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, //* I reached to this number by trial and error
    overscan: 10,
    debug: process.env.NODE_ENV === "development" ? true : false
  })

  useLayoutEffect(() => {
    registerShortcuts({
      "CommandOrControl+A": [table],
      "CommandOrControl+C": [table, contextMenuRow],
      Delete: [table, tableName, queryClient, contextMenuRow]
    })
  })

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="flex items-center justify-between p-4">
        <h1 className="w-full  text-2xl font-bold ">{tableName}</h1>
        <PaginationControls table={table} />
      </div>
      {isRowsLoading ? (
        <LoadingSpinner />
      ) : (
        <ContextMenu>
          <Table
            ref={tableRef}
            virtualizer={virtualizer}
            virtualizerRef={parentRef}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="sticky top-0 backdrop-blur-lg"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-sm font-bold lg:text-base"
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
                  virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    return (
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
                    )
                  })
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
                  router={router}
                  contextMenuRow={contextMenuRow}
                />
              </TableBody>
            </ContextMenuTrigger>
          </Table>
        </ContextMenu>
      )}
      <EditRowSheet
        tableName={tableName}
        setIsSheetOpen={setIsSheetOpen}
        row={contextMenuRow}
        table={table}
      />
    </Sheet>
  )
}

export default DataTable

interface TableContextMenuContentProps {
  table: TableType<any>
  contextMenuRow?: Row<any>
  tableName: string
  router: Router
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

const TableContextMenuContent = ({
  table,
  tableName,
  router,
  setIsSheetOpen,
  contextMenuRow
}: TableContextMenuContentProps) => {
  if (!contextMenuRow) return null
  return (
    <ContextMenuContent
      className="bg-background/40 backdrop-blur-md"
      data-side="bottom"
    >
      <ContextMenuItem
        onSelect={async () =>
          await deleteRows(table, tableName, router, contextMenuRow)
        }
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

interface PaginationControlsProps {
  table: TableType<any>
}

const PaginationControls = ({ table }: PaginationControlsProps) => {
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-1 h-4 w-4 p-0" />
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            {table.getState().pagination.pageIndex + 1}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4 p-0" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
