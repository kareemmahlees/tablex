"use client"
import { useQuery } from "@tanstack/react-query"
import { Search, Table } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import LoadingSpinner from "@/components/loading-spinner"
import { Input } from "@/components/ui/input"
import { unregisterAll } from "@tauri-apps/api/globalShortcut"
import {
  KeyboardEvent,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
  type FC
} from "react"
import CreateNewRowBtn from "./_components/create-row"
import {
  establishConnection,
  getConnectionDetails,
  getTables,
  registerSearchShortcut
} from "./actions"

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const params = useSearchParams()
  const connectionId = params.get("id")!
  const tableName = params.get("tableName")!
  const [tables, setTables] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    // unregistering is useful to see changes made in shortcuts
    unregisterAll().then(() => {
      registerSearchShortcut(inputRef)
    })
  })

  const { data, isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const connDetails = await getConnectionDetails(connectionId)
      await establishConnection(connDetails.conn_string)
      const tables = await getTables()
      setTables(tables)
      return { connName: connDetails.conn_name, tables }
    }
  })

  let timeout: NodeJS.Timeout
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const searchPattern = e.currentTarget.value
    if (searchPattern === "") return setTables(data?.tables!)

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      const filteredTables = tables.filter((table) =>
        table.includes(searchPattern)
      )
      setTables(filteredTables)
    }, 100)
  }

  if (isLoading) <LoadingSpinner />

  return (
    <main className="flex h-screen">
      <aside className="bg-zinc-800 flex flex-col items-start justify-between w-56 lg:w-72 p-3 lg:p-5 overflow-y-auto">
        <div className="flex flex-col items-start gap-y-4 lg:gap-y-5 mb-4">
          <h1 className="font-bold text-lg">{data?.connName}</h1>
          <div className="flex items-center bg-background rounded-sm px-1">
            <Search className="h-3 lg:h-5" color="#4a506f" />
            <Input
              ref={inputRef}
              onKeyUp={handleKeyUp}
              placeholder="Search..."
              className="h-6 lg:h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-xs lg:placeholder:text-base text-sm"
            />
            <div className="items-center text-xs gap-x-1 hidden lg:flex">
              <p className="bg-muted rounded-sm px-1 py-[0.5px]">Ctrl</p>
              <p>+</p>
              <p className="bg-muted rounded-sm px-1 py-[0.5px]">S</p>
            </div>
          </div>
          <ul className="flex flex-col items-start gap-y-1 ">
            {tables.map((table, index) => {
              return (
                <li
                  key={index}
                  className="flex items-center justify-center text-white text-sm lg:text-base gap-x-1"
                  role="button"
                  onClick={() => {
                    router.push(
                      `/dashboard/details?tableName=${table}&id=${connectionId}`
                    )
                  }}
                >
                  <Table size={16} className="fill-amber-600 text-black" />
                  {table}
                </li>
              )
            })}
          </ul>
        </div>
        {tableName && <CreateNewRowBtn />}
      </aside>
      <div className="overflow-auto w-full h-full">{children}</div>
    </main>
  )
}

export default DashboardLayout
