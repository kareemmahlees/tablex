import { commands } from "@/bindings"
import { deleteConnectionCmd } from "@/commands/connection"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { LOCAL_STORAGE } from "@/lib/constants"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { MoreHorizontal, Trash } from "lucide-react"
import { Suspense } from "react"

// const DRIVERS_ICONS: Record<keyof typeof Drivers, ReactNode> = {
//   [Drivers.SQLite]: <SQLite width={30} height={30} />,
//   [Drivers.PostgreSQL]: <PostgreSQL width={30} height={30} />,
//   [Drivers.MySQL]: <MySQL width={30} height={30} />
// }

export const Route = createFileRoute("/connections")({
  // beforeLoad: async () => {
  //   const result = await commands.connectionsExist()
  //   const connectionExist = unwrapResult(result)
  //   if (!connectionExist) {
  //     throw redirect({ to: "/" })
  //   }
  // },
  loader: () => commands.getConnections(),
  staleTime: 0,
  component: ConnectionsPage
})

function ConnectionsPage() {
  const router = useRouter()
  const connections = Route.useLoaderData()

  const onClickConnect = async (connectionId: string) => {
    const connectionDetails = await commands.getConnectionDetails(connectionId)

    await commands.establishConnection(
      connectionDetails.connString,
      connectionDetails.driver
    )
    const latestTable = localStorage.getItem(
      LOCAL_STORAGE.LATEST_TABLE(connectionId)
    )

    if (latestTable) {
      return router.navigate({
        to: "/dashboard/table-view/$tableName",
        params: {
          tableName: latestTable
        },
        search: {
          connectionId
        }
      })
    }

    router.navigate({
      to: "/dashboard/table-view/land",
      search: { connectionId }
    })
  }

  return (
    <main className="flex h-full items-start">
      <ul className="flex h-full flex-[0.5] flex-col justify-start gap-y-5 overflow-y-auto p-5 lg:p-7">
        <Suspense fallback={<LoadingSpinner />}>
          {Object.entries(connections).map(([id, config]) => {
            return (
              <li key={id}>
                <div className="flex justify-between">
                  {/* {DRIVERS_ICONS[config.driver]} */}
                  <Button
                    variant={"ghost"}
                    className="flex flex-1 justify-start"
                    onClick={() => onClickConnect(id)}
                  >
                    <div className="flex items-end gap-x-2">
                      <p className="text-lg font-medium lg:text-xl">
                        {config.connName}
                      </p>
                      <p className="text-muted-foreground mb-1 text-xs lg:text-sm">
                        {config.driver}
                      </p>
                    </div>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant={"ghost"} size={"icon"}>
                        <MoreHorizontal className="h-5 w-5 lg:h-6 lg:w-6" />
                      </Button>
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
