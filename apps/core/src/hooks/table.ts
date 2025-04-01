import { getZodSchemaFromCols } from "@/commands/columns"
import { useSettings } from "@/features/settings/manager"
import { generateColumnsDefs } from "@/routes/dashboard/_layout/_table-view-layout/table-view/$tableName/-components/columns"
import { useTableState } from "@/state/tableState"
import { TableLocalStorage } from "@/types"
import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils"
import { useQuery } from "@tanstack/react-query"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type Row,
  type SortingState
} from "@tanstack/react-table"
import { useMemo, useRef, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { useGetPaginatedRows } from "./row"

export const useGetTableColumns = (tableName: string) => {
  const { updatePkColumn } = useTableState()
  return useQuery({
    queryKey: ["table_columns", tableName],
    queryFn: async () => await generateColumnsDefs(tableName, updatePkColumn)
  })
}

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

type SetupReactTableOptions<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  tableName: string
  connectionId?: string
}

/**
 * Fetches paginated rows and sets up tanstack table
 * with all the necessary attachments and logic.
 */
export const useSetupReactTable = <TData, TValue>({
  tableName,
  columns,
  connectionId
}: SetupReactTableOptions<TData, TValue>) => {
  const { defaultData, pagination, setPagination, pageIndex, pageSize } =
    useSetupPagination(connectionId)
  const { globalFilter, setGlobalFilter } = useTableState()

  const { data: rows, isLoading: isRowsLoading } = useGetPaginatedRows(
    tableName,
    pageIndex,
    pageSize
  )
  const [contextMenuRow, setContextMenuRow] = useState<Row<any>>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const tableRef = useRef<HTMLTableElement>(null)
  const table = useReactTable({
    data: (rows?.data as TData[]) ?? defaultData,
    columns,
    pageCount: rows?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      sorting,
      rowSelection,
      pagination,
      globalFilter
    },
    manualPagination: true,
    debugTable: import.meta.env.DEV
  })

  return {
    isRowsLoading,
    contextMenuRow,
    setContextMenuRow,
    tableRef,
    table
  }
}

/**
 * Sets up the state and memoization for page index & page size
 * to be used in paginating the rows.
 */
const useSetupPagination = (connectionId?: string) => {
  const settings = useSettings()
  const [{ pageIndex: persistedPageIndex }] =
    useLocalStorage<TableLocalStorage>(`@tablex/${connectionId}`, {
      tableName: "",
      pageIndex: 0
    })
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: persistedPageIndex,
    pageSize: 0 // TODO: FIX ME
  })
  const defaultData = useMemo(() => [], [])
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  )
  return { defaultData, pagination, setPagination, pageIndex, pageSize }
}
