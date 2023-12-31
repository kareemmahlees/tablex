"use client"
import LoadingSpinner from "@/components/loading-spinner"
import { useQueries } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useRef } from "react"
import { generateColumnsDefs } from "./_components/columns"
import DataTable from "./_components/data-table"
import { getRows } from "./actions"

const TableDataPage = () => {
  const tableName = useSearchParams().get("tableName")!
  const sectionRef = useRef<HTMLDivElement>(null)

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
    <section
      className="flex flex-col overflow-auto w-full will-change-scroll"
      ref={sectionRef}
    >
      <h1 className="font-bold text-2xl p-4 w-full ">{tableName}</h1>
      <DataTable columns={columns!} data={rows!} />
    </section>
  )
}

export default TableDataPage
