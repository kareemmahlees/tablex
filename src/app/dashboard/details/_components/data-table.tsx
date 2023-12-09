"use client";

import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Sheet } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteRows } from "../actions";
import EditRowSheet from "./edit-row-sheet";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const tableName = useSearchParams().get("tableName")!;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [contextMenuRow, setContextMenuRow] = useState<Row<any>>();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });
  useEffect(() => {
    unregisterAll().then((_) => {
      register("Delete", () => {
        const column = table.getAllColumns()[1].id;
        const rows = table
          .getSelectedRowModel()
          .rows.map((row) => row.getValue(column));

        if (rows.length > 0) {
          toast.promise(
            deleteRows(column, rows, tableName),
            {
              loading: "Operating...",
              success: (rowsAffected) => {
                queryClient.invalidateQueries({ queryKey: ["table_rows"] });
                return `Successfully deleted ${
                  rowsAffected === 1 ? "1 row" : rowsAffected + " rows"
                }`;
              },
              error: (err) => err,
            },
            {
              position: "top-right",
            }
          );
        }
        table.toggleAllRowsSelected(false);
      });
    });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <ContextMenu>
        <Table className="text-xs lg:text-sm inline-block">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="text-center">
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
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <ContextMenuTrigger asChild>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => row.toggleSelected(!row.getIsSelected())}
                    className="hover:bg-muted/10 data-[state=selected]:bg-muted/10 transition-colors"
                    onContextMenu={(e) => setContextMenuRow(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-white">
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
                    className="h-24 text-center text-white"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={async (e) => {
                    const column = table.getAllColumns()[1].id;
                    const row = contextMenuRow?.getValue<number>(column)!;
                    await deleteRows(column, row, tableName);
                    queryClient.invalidateQueries({ queryKey: ["table_rows"] });
                  }}
                >
                  Delete
                  <ContextMenuShortcut>Delete</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setOpen(true)}>
                  Edit
                  <ContextMenuShortcut>F2</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </TableBody>
          </ContextMenuTrigger>
        </Table>
      </ContextMenu>
      {contextMenuRow && (
        <EditRowSheet setOpenSheet={setOpen} row={contextMenuRow!} />
      )}
    </Sheet>
  );
}
