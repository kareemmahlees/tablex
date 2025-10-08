import { commands, TxError } from "@/bindings"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { ConnectionCard } from "@/features/connections/components/connection-card"
import { NewConnectionBtn } from "@/features/connections/components/new-connection-btn"
import { useSettings } from "@/features/settings/context"
import { LOCAL_STORAGE } from "@/lib/constants"
import { createFileRoute } from "@tanstack/react-router"
import { Database } from "lucide-react"
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
    try {
      await commands.establishConnection(connId)
    } catch (error) {
      return toast.error("Something went wrong.", {
        description: (error as TxError).details
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

  if (connections.length === 0) {
    return (
      <main className="flex h-full flex-col items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <Database />
            </EmptyMedia>
          </EmptyHeader>
          <div className="max-w-lg space-y-3">
            <EmptyTitle>No Connections</EmptyTitle>
            <EmptyDescription>
              You haven't created any connections yet. Get started by creating
              your first connection
            </EmptyDescription>
          </div>
          <EmptyContent>
            <NewConnectionBtn />
          </EmptyContent>
        </Empty>
      </main>
    )
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
                onClick={() => {
                  if (document.querySelector('[data-state="open"]')) {
                    return
                  }
                  onClickConnect(connection.id)
                }}
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
