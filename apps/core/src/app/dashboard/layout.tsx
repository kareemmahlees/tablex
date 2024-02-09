"use client"
import { useQuery } from "@tanstack/react-query"
import { Search, Table } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import LoadingSpinner from "@/components/loading-spinner"
import { Input } from "@/components/ui/input"
import { unregister } from "@tauri-apps/api/globalShortcut"
import {
  KeyboardEvent,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import APIDocsDialog from "./_components/api-docs-dialog"
import CommandPalette from "./_components/command-palette"
import AddRowBtn from "./_components/create-row-sheet"
import {
  establishConnection,
  getConnectionDetails,
  getTables,
  registerSearchShortcut
} from "./actions"

const DashboardLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter()
  const params = useSearchParams()
  const connectionId = params.get("id")!
  const tableName = params.get("tableName")!
  const [tables, setTables] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    unregister("CommandOrControl+S").then(() =>
      registerSearchShortcut(inputRef)
    )
  })

  const { data, isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const connDetails = await getConnectionDetails(connectionId)
      const error = await establishConnection(
        connDetails.connString,
        connDetails.driver,
        router
      )
      if (error) return
      const tables = await getTables()
      setTables(tables)
      return { connName: connDetails.connName, tables }
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

  if (isLoading) return <LoadingSpinner />

  return (
    <main className="flex h-full">
      <aside className="flex w-56 flex-col items-start justify-between overflow-y-auto bg-zinc-800 p-3 lg:w-72 lg:p-5">
        <div className="mb-4 flex flex-col items-start gap-y-4 lg:gap-y-5">
          <h1 className="text-lg font-bold text-gray-500">{data?.connName}</h1>
          <div className="bg-background flex items-center rounded-sm px-1">
            <Search className="h-3 lg:h-5" color="#4a506f" />
            <Input
              ref={inputRef}
              onKeyUp={handleKeyUp}
              placeholder="Search..."
              className="h-6 border-none text-sm placeholder:text-xs focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-8 lg:placeholder:text-base"
            />
            <div className="hidden items-center gap-x-1 text-xs lg:flex">
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
                  className="flex items-center justify-center gap-x-1 text-sm text-white lg:text-base"
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
        {tableName && <AddRowBtn />}
      </aside>
      {children}
      <CommandPalette setIsDialogOpen={setIsDialogOpen} />
      <APIDocsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </main>
  )
}

export default DashboardLayout
