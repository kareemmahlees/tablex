import { commands } from "@/bindings"
import { ConnectionCard } from "@/features/connections/components/connection-card"
import { NewConnectionBtn } from "@/features/connections/components/new-connection-btn"
import { useSettings } from "@/features/settings/context"
import { LOCAL_STORAGE } from "@/lib/constants"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute("/")({
  loader: commands.getConnections,
  component: Index
})

function Index() {
  const navigate = Route.useNavigate()
  const connections = Route.useLoaderData()
  const settings = useSettings()

  const onClickConnect = async (connId: number) => {
    const connectionDetails = await commands.getConnectionDetails(connId)

    try {
      await commands.establishConnection(
        connectionDetails.connectionString,
        connectionDetails.driver
      )
    } catch (error) {
      return toast.error("Something went wrong.", {
        description: error as string
      })
    }
    const latestTable = localStorage.getItem(LOCAL_STORAGE.LATEST_TABLE(connId))

    if (latestTable) {
      return navigate({
        to: "/connection/$connId/table-view/$tableName",
        params: {
          connId,
          tableName: latestTable
        },
        search: {
          sorting: [],
          pagination: { pageIndex: 0, pageSize: settings.pageSize },
          filtering: [],
          joinOperator: "and"
        }
      })
    }

    navigate({
      to: "/connection/$connId/table-view/empty",
      params: { connId }
    })
  }

  return (
    <main className="flex h-full w-full flex-col items-center py-10">
      <div className="flex w-2/3 flex-col items-center gap-y-10">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Connections</h1>
          <NewConnectionBtn />
        </div>
        <ul className="grid h-full w-full grid-cols-3 gap-5 overflow-y-auto">
          {connections.map((connection) => {
            return (
              <li
                key={connection.id}
                onClick={() => onClickConnect(connection.id)}
                className="hover:cursor-pointer"
              >
                <ConnectionCard connection={connection} />
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
