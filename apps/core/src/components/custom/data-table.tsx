import type { ColumnInfo } from "@/bindings"
import { ScrollArea } from "@/components/ui/scroll-area"
import { flexRender, Table as TanstackTable } from "@tanstack/react-table"
import { ScrollBar } from "../ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table"

export const DataTable = ({ table }: { table: TanstackTable<ColumnInfo> }) => {
  return (
    <ScrollArea className="relative h-full w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-sidebar sticky top-0 backdrop-blur-lg"
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-muted/70 data-[state=selected]:bg-muted/70"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="w-1">
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
