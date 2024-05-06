"use client"
import {
  deleteConnection,
  establishConnection,
  getConnectionDetails,
  getConnections
} from "@/commands/connection"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { MoreHorizontal, Trash } from "lucide-react"
import { Suspense } from "react"
import toast from "react-hot-toast"

export const Route = createFileRoute("/connections")({
  loader: async ({ navigate }) => {
    const connections = await getConnections()
    if (Object.entries(connections).length === 0) navigate({ to: "/" })
    return connections
  },
  staleTime: 0,
  component: ConnectionsPage
})

function ConnectionsPage() {
  const router = useRouter()
  const connections = Route.useLoaderData()

  const onClick = async (connectionId: string) => {
    const connDetails = await getConnectionDetails(connectionId)
    try {
      await establishConnection(connDetails.connString, connDetails.driver)
      router.navigate({
        to: "/dashboard/layout/land",
        search: { connectionName: connDetails.connName }
      })
    } catch (error) {
      toast.error(error as string, { id: "connection_error" })
    }
  }

  return (
    <main className="flex h-full items-start">
      <ul className="flex h-full flex-[0.5] flex-col justify-start gap-y-5 overflow-y-auto p-5 lg:p-7">
        <Suspense fallback={<LoadingSpinner />}>
          {Object.entries(connections).map(([id, config]) => {
            return (
              <li key={id} onClick={() => onClick(id)} role="button">
                <div className="flex justify-between">
                  <div className="w-full">
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
                        onSelect={async () =>
                          await deleteConnection(router, id)
                        }
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
