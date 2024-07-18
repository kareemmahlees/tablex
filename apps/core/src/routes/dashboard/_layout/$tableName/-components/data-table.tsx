"use client"

import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TableType
} from "@tanstack/react-table"

import { useVirtualizer } from "@tanstack/react-virtual"

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VirtualTable
} from "@/components/ui/table"

import { events } from "@/bindings"
import { deleteRowsCmd } from "@/commands/row"
import LoadingSpinner from "@/components/loading-spinner"
import EditRowSheet from "@/components/sheets/edit-row-sheet"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { Sheet } from "@/components/ui/sheet"
import { useSetupReactTable } from "@/hooks/table"
import { useKeybindingsManager } from "@/keybindings/manager"
import { copyRows } from "@/keybindings/row"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import ForeignKeyDropdown from "./fk-dropdown"
import TableActions from "./table-actions"

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
  const queryClient = useQueryClient()
  const keybindingsManager = useKeybindingsManager()

  useEffect(() => {
    const unlisten = events.tableContentsChanged.listen(() => {
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [queryClient])

  keybindingsManager.registerKeybindings([
    {
      command: "copyRow",
      handler: () => copyRows(table.getSelectedRowModel().rows)
    },
    {
      command: "deleteRow",
      handler: () =>
        deleteRowsCmd(table, tableName, table.getSelectedRowModel().rows)
    }
  ])

  const { rows } = table.getRowModel()

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // I reached to this number by trial and error
    overscan: 10,
    debug: import.meta.env.DEV
  })

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <TableActions table={table} tableName={tableName} />
      {isRowsLoading ? (
        <LoadingSpinner />
      ) : (
        <ContextMenu>
          <VirtualTable
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
                        // onClick={() => row.toggleSelected(!row.getIsSelected())}
                        className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
                        onContextMenu={() => setContextMenuRow(row)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            <div className="flex items-center gap-x-2">
                              {cell.column.columnDef.meta?.hasFkRelations ? (
                                <ForeignKeyDropdown
                                  tableName={tableName}
                                  columnName={cell.column.columnDef.meta.name}
                                  cellValue={cell.getValue()}
                                />
                              ) : null}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
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
                  contextMenuRow={contextMenuRow}
                />
              </TableBody>
            </ContextMenuTrigger>
          </VirtualTable>
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
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

const TableContextMenuContent = ({
  table,
  tableName,
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
          await deleteRowsCmd(table, tableName, [contextMenuRow])
        }
      >
        Delete
        <ContextMenuShortcut>Delete</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIsSheetOpen(true)}>
        Edit
      </ContextMenuItem>
      <ContextMenuItem onClick={async () => await copyRows([contextMenuRow])}>
        Copy
        <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
