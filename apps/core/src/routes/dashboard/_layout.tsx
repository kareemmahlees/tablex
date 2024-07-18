import { commands } from "@/bindings"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { focusSearch } from "@/keybindings"
import { useKeybindingsManager } from "@/keybindings/manager"
import { cn } from "@tablex/lib/utils"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { ArrowLeft, Search, Table } from "lucide-react"
import { useState, type KeyboardEvent } from "react"
import toast from "react-hot-toast"
import { z } from "zod"
import AddRowBtn from "../../components/sheets/create-row-sheet"
import CommandPalette from "./_layout/-components/command-palette"
import MetaXDialog from "./_layout/-components/metax-dialog"

const dashboardConnectionSchema = z.object({
  connectionName: z.string().optional(),
  tableName: z.string().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { tableName, connectionName } }) => ({
    connectionName,
    tableName
  }),
  loader: async ({ deps: { connectionName }, navigate }) => {
    const connName = connectionName || "Temp Connection"

    const tables = await commands.getTables()
    if (tables.status === "error") {
      toast.error(tables.error, { id: "get_tables" })
      return navigate({ to: "../" })
    }

    return { connName, tables: tables.data }
  },
  component: DashboardLayout
})

// const loadKeybindings = () => {
//   readTextFile("keybindings.json", {
//     baseDir: BaseDirectory.AppConfig
//   }).then((data) => {
//     const jsonData: Keybinding[] = JSON.parse(data)

//     jsonData.forEach((binding) => {
//       hotkeys(binding.shortcuts.join(","), () => {
//         //@ts-expect-error i think this is a bug with tauri-specta
//         events.keybindingEvent.emit(binding.command)
//       })
//     })
//   })
// }

function DashboardLayout() {
  const deps = Route.useLoaderDeps()
  const data = Route.useLoaderData()
  const keybindingsManager = useKeybindingsManager()
  const [tables, setTables] = useState<string[]>(data!.tables)

  keybindingsManager.registerKeybindings([
    {
      command: "focusSearch",
      handler: () => focusSearch()
    }
  ])

  let timeout: NodeJS.Timeout
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const searchPattern = e.currentTarget.value
    if (searchPattern === "") return setTables(data!.tables)

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
      <aside className="flex w-56 flex-col items-start justify-between bg-zinc-800 p-4 pt-2 lg:w-72 lg:p-6">
        <div className="mb-4 flex flex-col items-start gap-y-4 overflow-y-auto lg:gap-y-5">
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
          <h1 className="text-lg font-bold text-gray-500">{data!.connName}</h1>
          <div className="bg-background flex items-center rounded-sm px-1">
            <Search className="h-3 lg:h-5" color="#4a506f" />
            <Input
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
            <ul className="flex flex-col items-start gap-y-1 overflow-y-auto">
              {tables.map((table, index) => {
                return (
                  <Link
                    to="/dashboard/$tableName"
                    params={{
                      tableName: table
                    }}
                    search={{
                      connectionName: deps.connectionName,
                      tableName: table
                    }}
                    preload={false}
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
      <CommandPalette />
      <MetaXDialog />
    </main>
  )
}

export default DashboardLayout
