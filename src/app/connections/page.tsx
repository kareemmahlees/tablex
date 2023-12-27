"use client"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { deleteConnection, getConnections } from "./actions"

const ConnectionsPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const connections = await getConnections()
      if (Object.entries(connections).length === 0) router.push("/")
      return connections
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <main className="flex items-start h-full">
      <ul className="flex flex-col justify-start gap-y-5 p-5 lg:p-7 h-full flex-[0.5] overflow-y-auto">
        {Object.entries(connections!).map(([id, config]) => {
          return (
            <li key={id}>
              <div className="flex justify-between">
                <div
                  className="w-full"
                  role="button"
                  onClick={() => router.push(`/dashboard?id=${id}`)}
                >
                  <p className="lg:text-lg font-medium">{config.connName}</p>
                  <p className="text-muted-foreground text-sm lg:text-lg">
                    {config.driver}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="w-5 h-5 lg:w-6 lg:h-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={async () =>
                        await deleteConnection(queryClient, id)
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
      </ul>
      <aside className="relative flex flex-col items-center gap-y-10 lg:gap-y-20 justify-center h-full flex-[0.5]">
        <div className="relative w-[120px] h-[120px] lg:w-[170px] lg:h-[170px]">
          <Image src={"/icons/planet.svg"} alt="planet" aria-hidden fill />
        </div>
        <CreateConnectionBtn />
        <div className="absolute h-full w-full -z-10 overflow-hidden opacity-30">
          <Image
            src={"/bg-2.svg"}
            alt="background"
            fill
            className="object-cover object-center"
            aria-label="hidden"
          />
        </div>
      </aside>
    </main>
  )
}

export default ConnectionsPage
