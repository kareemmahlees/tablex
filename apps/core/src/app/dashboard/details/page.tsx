"use client"
import LoadingSpinner from "@/components/loading-spinner"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { generateColumnsDefs } from "./_components/columns"
import DataTable from "./_components/data-table"

const TableDataPage = () => {
  const tableName = useSearchParams().get("tableName")!

  const { data: columns, isLoading: isColumnsLoading } = useQuery({
    queryKey: ["table_columns", tableName],
    queryFn: async () => await generateColumnsDefs(tableName)
  })

  if (isColumnsLoading) return <LoadingSpinner />

  return (
    <section className="flex w-full flex-col overflow-auto will-change-scroll">
      <DataTable columns={columns!} tableName={tableName} />
    </section>
  )
}

export default TableDataPage
