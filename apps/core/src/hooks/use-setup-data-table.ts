import type { PaginatedRows } from "@/bindings"
import { type RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import {
  type ColumnDef,
  type FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable
} from "@tanstack/react-table"
import { type Dispatch, type SetStateAction, useRef, useState } from "react"

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

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
  // const { data: rows, isLoading: isRowsLoading } = useGetPaginatedRows(
  //   tableName,
  //   pageIndex,
  //   pageSize
  // )
  const [contextMenuRow, setContextMenuRow] = useState<Row<any>>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const tableRef = useRef<HTMLTableElement>(null)
  const table = useReactTable({
    data: (data?.data as TData[]) ?? FALLBACK_DATA,
    columns,
    pageCount: data?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      sorting,
      rowSelection,
      pagination
    },
    manualPagination: true,
    debugTable: import.meta.env.DEV
  })

  return {
    contextMenuRow,
    setContextMenuRow,
    tableRef,
    table
  }
}
