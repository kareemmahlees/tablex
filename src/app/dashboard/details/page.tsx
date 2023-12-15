"use client"
import LoadingSpinner from "@/components/loading-spinner"
import { useQueries } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { generateColumnsDefs } from "./_components/columns"
import DataTable from "./_components/data-table"
import { getRows } from "./actions"

const TableDataPage = () => {
  const tableName = useSearchParams().get("tableName")!

  const {
    "0": { data: columns, isLoading: isColumnsLoading },
    "1": { data: rows, isLoading: isRowsLoading }
  } = useQueries({
    queries: [
      {
        queryKey: ["table_columns", tableName],
        queryFn: async () => await generateColumnsDefs(tableName)
      },
      {
        queryKey: ["table_rows", tableName],
        queryFn: async () => await getRows(tableName)
      }
    ]
  })

  if (isColumnsLoading || isRowsLoading) return <LoadingSpinner />

  return (
    <>
      <h1 className="font-bold text-2xl p-4 w-full">{tableName}</h1>
      <div className="overflow-auto">
        <DataTable columns={columns!} data={rows!} />
      </div>
    </>
  )
}

export default TableDataPage
