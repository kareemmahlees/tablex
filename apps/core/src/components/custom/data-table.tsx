import type { ColumnInfo } from "@/bindings"
import { cn } from "@tablex/lib/utils"
import { flexRender, Row, Table as TanstackTable } from "@tanstack/react-table"
import { forwardRef, HTMLAttributes } from "react"
import { TableVirtuoso } from "react-virtuoso"
import { TableCell, TableHead, TableRow } from "../ui/table"

const TableComponent = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
))
TableComponent.displayName = "TableComponent"

const TableRowComponent = <TData,>(rows: Row<TData>[]) =>
  function getTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
    const index = props["data-index"]
    const row = rows[index]

    if (!row) return null

    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        data-id={row.id}
        className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
      >
        {row.getVisibleCells().map((cell) => {
          return (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

export const DataTable = ({ table }: { table: TanstackTable<ColumnInfo> }) => {
  const { rows } = table.getCoreRowModel()

  // const parentRef = useRef<HTMLDivElement>(null)

  // const virtualizer = useVirtualizer({
  //   count: rows.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 5,
  //   debug: import.meta.env.DEV
  // })

  return (
    // <ScrollArea className="relative h-full w-full" ref={parentRef}>
    //   <Table>
    //     <TableHeader>
    //       {table.getHeaderGroups().map((headerGroup) => (
    //         <TableRow
    //           key={headerGroup.id}
    //           className="bg-sidebar sticky top-0 backdrop-blur-lg"
    //         >
    //           {headerGroup.headers.map((header) => {
    //             return (
    //               <TableHead
    //                 key={header.id}
    //                 className="text-sm font-bold lg:text-base"
    //               >
    //                 {header.isPlaceholder
    //                   ? null
    //                   : flexRender(
    //                       header.column.columnDef.header,
    //                       header.getContext()
    //                     )}
    //               </TableHead>
    //             )
    //           })}
    //         </TableRow>
    //       ))}
    //     </TableHeader>
    //     <TableBody>
    //       {virtualizer.getVirtualItems().map((virtualRow, index) => {
    //         const row = rows[virtualRow.index]
    //         return (
    //           <TableRow
    //             key={row.id}
    //             data-state={row.getIsSelected() && "selected"}
    //             data-id={row.id}
    //             className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
    //             style={{
    //               height: `${virtualRow.size}px`,
    //               transform: `translateY(${
    //                 virtualRow.start - index * virtualRow.size
    //               }px)`
    //             }}
    //           >
    //             {row.getVisibleCells().map((cell) => {
    //               return (
    //                 <TableCell key={cell.id}>
    //                   {flexRender(
    //                     cell.column.columnDef.cell,
    //                     cell.getContext()
    //                   )}
    //                 </TableCell>
    //               )
    //             })}
    //           </TableRow>
    //         )
    //       })}

    //       {/* {table.getRowModel().rows?.length ? (
    //         table.getRowModel().rows.map((row) => (
    //           <TableRow
    //             key={row.id}
    //             data-state={row.getIsSelected() && "selected"}
    //             className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
    //           >
    //             {row.getVisibleCells().map((cell) => (
    //               <TableCell key={cell.id} className="w-1">
    //                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
    //               </TableCell>
    //             ))}
    //           </TableRow>
    //         ))
    //       ) : (
    //         <TableRow>
    //           <TableCell
    //             colSpan={table.getAllColumns().length}
    //             className="h-24 text-center"
    //           >
    //             No results.
    //           </TableCell>
    //         </TableRow>
    //       )} */}
    //     </TableBody>
    //   </Table>
    //   <ScrollBar orientation="horizontal" />
    // </ScrollArea>
    <TableVirtuoso
      totalCount={rows.length}
      data={rows}
      components={{
        Table: TableComponent,
        TableRow: TableRowComponent(rows)
      }}
      fixedHeaderContent={() =>
        table.getHeaderGroups().map((headerGroup) => (
          // Change header background color to non-transparent
          <TableRow
            className="bg-sidebar sticky top-0 backdrop-blur-lg"
            key={headerGroup.id}
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize()
                  }}
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
        ))
      }
      // itemContent={(index, row) => (
      //   <TableRow
      //     key={row.id}
      //     data-state={row.getIsSelected() && "selected"}
      //     data-id={row.id}
      //     className="hover:bg-muted/70 data-[state=selected]:bg-muted/70 transition-colors"
      //   >
      //     {row.getVisibleCells().map((cell) => {
      //       return (
      //         <TableCell key={cell.id}>
      //           {flexRender(cell.column.columnDef.cell, cell.getContext())}
      //         </TableCell>
      //       )
      //     })}
      //   </TableRow>
      // )}
    />
  )
}
