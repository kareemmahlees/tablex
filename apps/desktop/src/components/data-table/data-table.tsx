import {
  flexRender,
  Row,
  type Table as TanstackTable
} from "@tanstack/react-table"
import type * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { getCommonPinningStyles } from "@/lib/data-table"
import { cn } from "@tablex/lib/utils"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData>({
  table,
  className,
  onRowClick
}: DataTableProps<TData>) {
  return (
    <ScrollArea
      className={cn("flex h-full w-full min-w-0 flex-1 flex-col", className)}
    >
      <Table>
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
                    ...getCommonPinningStyles({ column: header.column })
                  }}
                  className="text-sm font-bold lg:text-base"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                  onRowClick && onRowClick(row)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles({ column: cell.column })
                    }}
                    className="w-1"
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
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
