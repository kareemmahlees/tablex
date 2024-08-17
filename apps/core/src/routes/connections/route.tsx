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

    router.navigate({
      to: "/dashboard/land",
      search: { connectionName: connectionDetails.connName }
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
      <aside className="relative flex h-full flex-[0.5] flex-col items-center justify-center gap-y-14 lg:gap-y-20">
        <img
          src="/icons/planet.svg"
          alt="planet"
          className="h-[120px] w-[120px] lg:h-[170px] lg:w-[170px]"
          aria-hidden
        />
        <CreateConnectionBtn />
        <img
          src={"/connect.svg"}
          alt="background"
          className="absolute -z-10 h-full w-full object-cover object-center opacity-30"
          aria-hidden
        />
      </aside>
    </main>
  )
}

export default ConnectionsPage
