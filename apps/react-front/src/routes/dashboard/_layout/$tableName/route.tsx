import LoadingSpinner from "@/components/loading-spinner"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { generateColumnsDefs } from "./-components/columns"
import DataTable from "./-components/data-table"

export const Route = createFileRoute("/dashboard/_layout/$tableName")({
  component: TableData
})

function TableData() {
  const { tableName } = Route.useParams()

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
