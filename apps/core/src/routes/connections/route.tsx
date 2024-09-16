import { commands } from "@/bindings"
import { deleteConnectionCmd } from "@/commands/connection"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { unwrapResult } from "@/lib/utils"
import { TableLocalStorage } from "@/types"
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { MoreHorizontal, Trash } from "lucide-react"
import { Suspense } from "react"

export const Route = createFileRoute("/connections")({
  beforeLoad: async () => {
    const result = await commands.connectionsExist()
    const connectionExist = unwrapResult(result)
    if (!connectionExist) {
      throw redirect({ to: "/" })
    }
  },
  loader: async ({ abortController }) => {
    const commandResult = await commands.getConnections()
    const connections = unwrapResult(commandResult)
    if (!connections) {
      return abortController.abort(`error while getting connections`)
    }

    return connections
  },
  staleTime: 0,
  component: ConnectionsPage
})

function ConnectionsPage() {
  const router = useRouter()
  const connections = Route.useLoaderData()

  const onClickConnect = async (connectionId: string) => {
    const connectionDetailsResult =
      await commands.getConnectionDetails(connectionId)
    const connectionDetails = unwrapResult(connectionDetailsResult)

    if (!connectionDetails) return

    const establishConnectionResult = await commands.establishConnection(
      connectionDetails.connString,
      connectionDetails.driver
    )
    const connectionEstablishment = unwrapResult(establishConnectionResult)

    if (connectionEstablishment === false) return

    const connectionStorageData = localStorage.getItem(
      `@tablex/${connectionId}`
    )

    if (connectionStorageData) {
      const parsedConnectionData: TableLocalStorage = JSON.parse(
        connectionStorageData
      )
      return router.navigate({
        to: "/dashboard/$tableName",
        params: {
          tableName: parsedConnectionData.tableName
        },
        search: { connectionId }
      })
    }

    router.navigate({
      to: "/dashboard/land",
      search: { connectionId }
    })
  }

  return (
    <main className="flex h-full items-start">
      <ul className="flex h-full flex-[0.5] flex-col justify-start gap-y-5 overflow-y-auto p-5 lg:p-7">
        <Suspense fallback={<LoadingSpinner />}>
          {Object.entries(connections!).map(([id, config]) => {
            return (
              <li key={id}>
                <div className="flex justify-between">
                  <div
                    className="w-full"
                    onClick={() => onClickConnect(id)}
                    role="button"
                  >
                    <p className="font-medium lg:text-lg">{config.connName}</p>
                    <p className="text-muted-foreground text-sm lg:text-lg">
                      {config.driver}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 lg:h-6 lg:w-6" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={async () => {
                          await deleteConnectionCmd(id)
                          router.invalidate()
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Separator className="mt-3" />
              </li>
            )
          })}
        </Suspense>
      </ul>
      <aside className="dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex h-full flex-[0.5] flex-col items-center justify-center gap-y-14 bg-white lg:gap-y-20 dark:bg-black">
        <img
          src="/icons/planet.svg"
          alt="planet"
          className="z-10 h-[120px] w-[120px] lg:h-[170px] lg:w-[170px]"
          aria-hidden
        />
        <CreateConnectionBtn />
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      </aside>
    </main>
  )
}

export default ConnectionsPage
