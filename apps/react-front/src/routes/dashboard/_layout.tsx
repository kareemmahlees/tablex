import {
  establishConnection,
  getConnectionDetails
} from "@/commands/connection"
import { getTables } from "@/commands/table"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { registerShortcuts } from "@/shortcuts"
import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Search, Table } from "lucide-react"
import { useState, type KeyboardEvent } from "react"
import toast from "react-hot-toast"
import { z } from "zod"
import APIDocsDialog from "./_layout/-components/api-docs-dialog"
import CommandPalette from "./_layout/-components/command-palette"
import AddRowBtn from "./_layout/-components/create-row-sheet"

const dashboardConnectionSchema = z.object({
  connectionId: z.string().uuid().optional(),
  tableName: z.string().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { connectionId, tableName } }) => ({
    connectionId,
    tableName
  }),
  loader: async ({ deps: { connectionId }, navigate }) => {
    await registerShortcuts({ "CommandOrControl+S": [] })
    let connName: string

    if (connectionId) {
      const connDetails = await getConnectionDetails(connectionId)
      try {
        await establishConnection(connDetails.connString, connDetails.driver)
      } catch (error) {
        toast.error(error as string)
        navigate({ to: "/connections" })
      }
      connName = connDetails.connName
    } else {
      // * useful for `on the fly` connections
      connName = "Temp Connection"
    }

    const tables = await getTables()

    return { connName, tables }
  },
  component: DashboardLayout
})

function DashboardLayout() {
  const deps = Route.useLoaderDeps()
  const data = Route.useLoaderData()
  const [tables, setTables] = useState<string[]>(data?.tables)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // const inputRef = useRef<HTMLInputElement>(null)

  // if (import.meta.hot) {
  //   import.meta.hot.on("vite:beforeFullReload", () => {
  //     // unregisterAll()
  //     console.log("full reload")
  //   })
  // }

  // useEffect(() => {
  //   registerShortcuts(["CommandOrControl+S"])
  // })

  let timeout: NodeJS.Timeout
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const searchPattern = e.currentTarget.value
    if (searchPattern === "") return setTables(data.tables)

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      const filteredTables = tables.filter((table) =>
        table.includes(searchPattern)
      )
      setTables(filteredTables)
    }, 100)
  }

  return (
    <main className="flex h-full w-full">
      <aside className="flex w-56 flex-col items-start justify-between overflow-y-auto bg-zinc-800 p-4 pt-2 lg:w-72 lg:p-6">
        <div className="mb-4 flex flex-col items-start gap-y-4 lg:gap-y-5">
          <Link
            to="/connections"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hover:bg-muted-foreground/20 group -mb-2 h-6 p-2"
            )}
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              color="gray"
            />
          </Link>
          <h1 className="text-lg font-bold text-gray-500">{data.connName}</h1>
          <div className="bg-background flex items-center rounded-sm px-1">
            <Search className="h-3 lg:h-5" color="#4a506f" />
            <Input
              // ref={inputRef}
              id="search_input"
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
          <div className="mb-4 overflow-y-auto">
            <ul className="flex flex-col items-start gap-y-1 ">
              {tables.map((table, index) => {
                return (
                  <Link
                    to="/dashboard/layout/$tableName"
                    params={{
                      tableName: table
                    }}
                    search={{
                      connectionId: deps.connectionId,
                      tableName: table
                    }}
                    key={index}
                    className="flex items-center justify-center gap-x-1 text-sm text-white lg:text-base"
                    role="button"
                  >
                    <Table size={16} className="fill-amber-600 text-black" />
                    {table}
                  </Link>
                )
              })}
            </ul>
          </div>
        </div>
      </aside>
      {deps.tableName && <AddRowBtn tableName={deps.tableName} />}
      {tables.length > 0 && <Outlet />}
      <CommandPalette setIsDialogOpen={setIsDialogOpen} />
      <APIDocsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </main>
  )
}

export default DashboardLayout
