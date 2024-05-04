import LoadingSpinner from "@/components/loading-spinner"
import { useGetTableColumns } from "@/hooks/table"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import DataTable from "./-components/data-table"

const tablePageSchema = z.object({
  tableName: z.string().optional(),
  connectionName: z.string().optional()
})

export const Route = createFileRoute("/dashboard/_layout/$tableName")({
  validateSearch: tablePageSchema,
  component: TableData
})

function TableData() {
  const { tableName } = Route.useParams()

  const { data: columns, isLoading: isColumnsLoading } =
    useGetTableColumns(tableName)

  if (isColumnsLoading) return <LoadingSpinner />

  return (
    <section className="flex w-full flex-col overflow-auto will-change-scroll">
      <DataTable columns={columns!} tableName={tableName} />
    </section>
  )
}
