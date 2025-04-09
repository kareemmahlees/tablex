import { PaginatedRows } from "@/bindings"
import { getZodSchemaFromCols } from "@/commands/columns"
import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils"
import { useQuery } from "@tanstack/react-query"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type Row,
  type SortingState
} from "@tanstack/react-table"
import { Dispatch, SetStateAction, useRef, useState } from "react"

// export const useGetTableColumns = (tableName: string) => {
//   const { updatePkColumn } = useTableState()
//   return useQuery({
//     queryKey: ["table_columns", tableName],
//     queryFn: async () => await generateColumnsDefs(tableName, updatePkColumn)
//   })
// }

/**
 * Calls the backend and returns a generated zod schema
 * representing the column definition for the given table.
 */
export const useGetZodSchema = (tableName: string) => {
  return useQuery({
    queryKey: [tableName],
    queryFn: async () => await getZodSchemaFromCols(tableName)
  })
}

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

type SetupReactTableOptions<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: PaginatedRows
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
}

/**
 * Fetches paginated rows and sets up tanstack table
 * with all the necessary attachments and logic.
 */
export const useSetupReactTable = <TData, TValue>({
  columns,
  data,
  pagination,
  setPagination
}: SetupReactTableOptions<TData, TValue>) => {
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
