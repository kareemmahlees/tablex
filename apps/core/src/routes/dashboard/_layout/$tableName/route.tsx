import LoadingSpinner from "@/components/loading-spinner"
import { useGetTableColumns } from "@/hooks/table"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "react-hot-toast"
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

  const {
    data: columns,
    isLoading: isColumnsLoading,
    error
  } = useGetTableColumns(tableName)

  if (isColumnsLoading) return <LoadingSpinner />

  if (error) return toast.error(error.message, { id: "get_table_columns" })

  return (
    <section className="flex w-full flex-col overflow-auto will-change-scroll">
      <DataTable columns={columns!} tableName={tableName} />
    </section>
  )
}
