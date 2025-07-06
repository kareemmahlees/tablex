import type { PaginatedRows } from "@/bindings"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  useReactTable
} from "@tanstack/react-table"
import { type Dispatch, type SetStateAction, useRef, useState } from "react"

const FALLBACK_DATA = []

type SetupDataTableOptions<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: PaginatedRows
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
}

/**
 * Fetches paginated rows and sets up tanstack table
 * with all the necessary attachments and logic.
 */
export const useSetupDataTable = <TData, TValue>({
  columns,
  data,
  pagination,
  setPagination
}: SetupDataTableOptions<TData, TValue>) => {
  const [contextMenuRow, setContextMenuRow] = useState<Row<any>>()
  const [rowSelection, setRowSelection] = useState({})
  const tableRef = useRef<HTMLTableElement>(null)
  const table = useReactTable({
    data: (data?.data as TData[]) ?? FALLBACK_DATA,
    columns,
    pageCount: data?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      rowSelection,
      pagination
    },
    manualPagination: true,
    manualSorting: true,
    debugTable: import.meta.env.DEV
  })

  return {
    contextMenuRow,
    setContextMenuRow,
    tableRef,
    table
  }
}
