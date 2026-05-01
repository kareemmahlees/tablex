import {
  flexRender,
  Row,
  type Table as TanstackTable
} from "@tanstack/react-table"
import React, { useMemo } from "react"

import { getCommonPinningStyles } from "@/lib/data-table"
import { cn } from "@tablex/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@tablex/ui/components/table"

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData>({
  table,
  className,
  onRowClick
}: DataTableProps<TData>) {
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-1 flex-col overflow-x-auto overflow-ellipsis",
        className
      )}
    >
      <Table
        style={{
          ...columnSizeVars,
          width: table.getTotalSize()
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-sidebar sticky top-0 z-50 backdrop-blur-lg"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    ...getCommonPinningStyles({ column: header.column }),
                    width: `calc(var(--header-${header.id}-size) * 1px)`
                  }}
                  className="group relative overflow-hidden truncate whitespace-nowrap text-sm font-bold lg:text-base"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  <div
                    onDoubleClick={() => header.column.resetSize()}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={cn(
                      "absolute right-0 top-1/2 h-4/5 w-2 -translate-y-1/2 cursor-col-resize touch-none select-none rounded-sm transition-colors",
                      header.column.getIsResizing()
                        ? "bg-primary"
                        : "group-hover:bg-muted-foreground/30 bg-transparent"
                    )}
                    aria-label="Resize column"
                    role="separator"
                    data-resizer="true"
                  />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "hover:bg-muted/70 data-[state=selected]:bg-muted/70",
                  onRowClick && "hover:cursor-pointer"
                )}
                onClick={() => {
                  if (document.getElementById("editor")) return
                  onRowClick?.(row)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles({ column: cell.column }),
                      width: `calc(var(--col-${cell.column.id}-size) * 1px)`
                    }}
                    className="w-1 overflow-hidden truncate whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 truncate text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
