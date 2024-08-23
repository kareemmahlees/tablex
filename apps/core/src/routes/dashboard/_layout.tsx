import { commands } from "@/bindings"
import CommandPalette from "@/components/dialogs/command-palette-dialog"
import MetaXDialog from "@/components/dialogs/metax-dialog"
import PreferencesDialog from "@/components/dialogs/preferences/preferences-dilaog"
import AddRowBtn from "@/components/sheets/create-row-sheet"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { focusSearch } from "@/keybindings"
import { useKeybindings } from "@/keybindings/manager"
import { unwrapResult } from "@/lib/utils"
import { cn } from "@tablex/lib/utils"
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router"
import { ArrowLeft, Table } from "lucide-react"
import { useEffect, useState, type KeyboardEvent } from "react"
import { z } from "zod"

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
  loader: async ({ deps: { connectionName } }) => {
    const connName = connectionName || "Temp Connection"

    const tables = unwrapResult(await commands.getTables())
    if (!tables)
      throw redirect({
        to: "/connections"
      })

    return { connName, tables }
  },
  onLeave: async () => unwrapResult(await commands.killMetax()),
  component: DashboardLayout
})

function DashboardLayout() {
  const deps = Route.useLoaderDeps()
  const data = Route.useLoaderData()
  const keybindingsManager = useKeybindings()
  const [tables, setTables] = useState<string[]>(data!.tables)

  useEffect(() => {
    keybindingsManager.registerKeybindings([
      {
        command: "focusSearch",
        handler: () => focusSearch()
      }
    ])
  }, [keybindingsManager])

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
        <div className="mb-4 flex w-full flex-col items-start gap-y-4 overflow-y-auto lg:gap-y-5">
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
          <h1 className="w-full text-center text-lg font-bold text-gray-500">
            {data!.connName}
          </h1>
          <div className="flex w-full items-center justify-center rounded-sm px-1">
            <Input
              id="search_input"
              onKeyUp={handleKeyUp}
              placeholder="Search..."
              className="h-6 border-none text-sm transition-all placeholder:text-xs focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-8 lg:w-[170px] lg:placeholder:text-base lg:focus:w-full"
            />
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
      <PreferencesDialog />
      <MetaXDialog />
    </main>
  )
}

export default DashboardLayout
