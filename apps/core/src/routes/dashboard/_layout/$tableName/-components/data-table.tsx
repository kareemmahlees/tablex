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

import { events, type ColumnProps } from "@/bindings"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sheet } from "@/components/ui/sheet"
import { useSetupReactTable } from "@/hooks/table"
import { useKeybindings } from "@/keybindings/manager"
import { copyRows } from "@/keybindings/row"
import { useEditRowSheetState } from "@/state/sheetState"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import TableActions from "./table-actions"

interface DataTableProps {
  columns: ColumnDef<ColumnProps>[]
  tableName: string
}

const DataTable = ({ columns, tableName }: DataTableProps) => {
  const { isRowsLoading, contextMenuRow, setContextMenuRow, table, tableRef } =
    useSetupReactTable({ columns, tableName })
  const queryClient = useQueryClient()
  const keybindingsManager = useKeybindings()
  const { isOpen, toggleSheet } = useEditRowSheetState()

  useEffect(() => {
    const unlisten = events.tableContentsChanged.listen(() => {
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [queryClient])

  useEffect(() => {
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
  }, [keybindingsManager, table, tableName])

  const parentRef = useRef<HTMLDivElement>(null)

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: table.getRowCount(),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // I reached to this number by trial and error
    overscan: 10,
    debug: import.meta.env.DEV
  })

  return (
    <Sheet open={isOpen} onOpenChange={toggleSheet}>
      <TableActions table={table} tableName={tableName} />
      {isRowsLoading ? (
        <LoadingSpinner />
      ) : (
        <ContextMenu>
          <ScrollArea className="relative h-full w-full overflow-auto">
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
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
                    contextMenuRow={contextMenuRow}
                  />
                </TableBody>
              </ContextMenuTrigger>
            </VirtualTable>
          </ScrollArea>
        </ContextMenu>
      )}
      <EditRowSheet tableName={tableName} row={contextMenuRow} table={table} />
    </Sheet>
  )
}

export default DataTable

interface TableContextMenuContentProps {
  table: TableType<any>
  contextMenuRow?: Row<any>
  tableName: string
}

const TableContextMenuContent = ({
  table,
  tableName,
  contextMenuRow
}: TableContextMenuContentProps) => {
  const { toggleSheet } = useEditRowSheetState()

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
      <ContextMenuItem onClick={() => toggleSheet(true)}>Edit</ContextMenuItem>
      <ContextMenuItem onClick={async () => await copyRows([contextMenuRow])}>
        Copy
        <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
