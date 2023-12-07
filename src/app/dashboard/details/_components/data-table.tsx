"use client";

import {
  ColumnDef,
  RowPinningState,
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

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteRows } from "../actions";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [rowPinning, setRowPinning] = useState<RowPinningState>({
    top: [],
    bottom: [],
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onRowPinningChange: setRowPinning,
    state: {
      sorting,
      rowSelection,
      rowPinning,
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
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, idx) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => row.toggleSelected(!row.getIsSelected())}
              className="hover:bg-muted/10 data-[state=selected]:bg-muted/10 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-white">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      </TableBody>
    </Table>
  );
}
