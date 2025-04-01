import { LOCAL_STORAGE } from "@/lib/constants"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useReadLocalStorage } from "usehooks-ts"

export const Route = createFileRoute(
  "/dashboard/_layout/_table-view-layout/table-view/land"
)({
  component: DashboardPage
})

function DashboardPage() {
  const { connectionId } = Route.useSearch()
  const navigate = useNavigate()
  const latest_table = useReadLocalStorage<string>(
    LOCAL_STORAGE.LATEST_TABLE(connectionId!)
  )

  if (latest_table) {
    return navigate({
      to: "/dashboard/table-view/$tableName",
      params: {
        tableName: latest_table
      },
      search: {
        connectionId
      }
    })
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-3 break-words text-center text-2xl font-bold text-gray-500 opacity-50">
      <img src={"/icons/cube.svg"} alt="cube" width={100} height={100} />
      Choose a table
      <br />
      to get started
    </div>
  )
}
