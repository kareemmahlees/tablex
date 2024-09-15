import LoadingSpinner from "@/components/loading-spinner"
import { useGetTableColumns } from "@/hooks/table"
import { useTableState } from "@/state/tableState"
import type { ActiveTableLocalStorage } from "@/types"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { toast } from "react-hot-toast"
import { useLocalStorage } from "usehooks-ts"
import { z } from "zod"
import DataTable from "./-components/data-table"

const tablePageSchema = z.object({
  tableName: z.string().optional(),
  connectionName: z.string()
})

export const Route = createFileRoute("/dashboard/_layout/$tableName")({
  validateSearch: tablePageSchema,
  component: TableData
})

function TableData() {
  const { tableName } = Route.useParams()
  const { connectionName } = Route.useSearch()
  const { updateTableName } = useTableState()
  const [, setActiveTable] = useLocalStorage<ActiveTableLocalStorage | null>(
    "@tablex/active-table",
    null
  )

  useEffect(() => updateTableName(tableName), [tableName, updateTableName])
  useEffect(() => setActiveTable({ connectionName, tableName }))

  const {
    data: columns,
    isPending: isColumnsPending,
    isError,
    error
  } = useGetTableColumns(tableName)

  if (isColumnsPending) return <LoadingSpinner />

  if (isError) return toast.error(error.message, { id: "get_table_columns" })

  return (
    <section className="flex w-full flex-col overflow-auto will-change-scroll">
      <DataTable columns={columns!} />
    </section>
  )
}
