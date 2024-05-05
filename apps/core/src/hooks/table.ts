import { getZodSchemaFromCols } from "@/commands/columns"
import { generateColumnsDefs } from "@/routes/dashboard/_layout/$tableName/-components/columns"
import { useQuery } from "@tanstack/react-query"
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Row,
  type SortingState
} from "@tanstack/react-table"
import { useMemo, useRef, useState } from "react"
import { useGetPaginatedRows } from "./row"

export const useGetTableColumns = (tableName: string) => {
  return useQuery({
    queryKey: ["table_columns", tableName],
    queryFn: async () => await generateColumnsDefs(tableName)
  })
}

export const useGetZodSchema = (tableName: string) => {
  return useQuery({
    queryKey: [tableName],
    queryFn: async () => await getZodSchemaFromCols(tableName)
  })
}

type SetupReactTableOptions<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  tableName: string
}

export const useSetupReactTable = <TData, TValue>({
  tableName,
  columns
}: SetupReactTableOptions<TData, TValue>) => {
  const { defaultData, pagination, setPagination, pageIndex, pageSize } =
    useSetupPagination()

  const { data: rows, isLoading: isRowsLoading } = useGetPaginatedRows(
    tableName,
    pageIndex,
    pageSize
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)
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
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      rowSelection,
      pagination
    },
    manualPagination: true,
    debugTable: process.env.NODE_ENV === "development" ? true : false
  })

  return {
    isRowsLoading,
    isSheetOpen,
    setIsSheetOpen,
    contextMenuRow,
    setContextMenuRow,
    tableRef,
    table
  }
}

const useSetupPagination = () => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500 // TODO: hard coded for now
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
