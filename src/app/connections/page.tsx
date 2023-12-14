"use client"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getConnections } from "./actions"

const ConnectionsPage = () => {
  const router = useRouter()
  const { data: connections = [], isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => {
      return await getConnections()
    }
  })

  if (isLoading) <LoadingSpinner />

  return (
    <main className="flex items-start h-full">
      <ul className="flex flex-col justify-start h-full gap-y-5 flex-[0.5] p-5 lg:p-10 overflow-y-auto">
        {Object.entries(connections).map(([id, config]) => {
          return (
            <li
              key={id}
              role="button"
              onClick={() => router.push(`/dashboard?id=${id}`)}
            >
              <p className="lg:text-xl font-medium">{config.conn_name}</p>
              <p className="text-muted-foreground text-sm lg:text-lg">
                {config.driver}
              </p>
              <Separator className="mt-4" />
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
