import { commands } from "@/bindings"
import CommandPalette from "@/components/dialogs/command-palette-dialog"
import MetaXDialog from "@/components/dialogs/metax-dialog"
import PreferencesDialog from "@/components/dialogs/preferences/preferences-dilaog"
import AddRowBtn from "@/components/sheets/create-row-sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { focusSearch } from "@/keybindings"
import { useKeybindings } from "@/keybindings/manager"
import { unwrapResult } from "@/lib/utils"
import { cn } from "@tablex/lib/utils"
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router"
import { ArrowLeft, PanelLeftClose, Table } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { useDebounceCallback } from "usehooks-ts"
import { z } from "zod"

const dashboardConnectionSchema = z.object({
  connectionId: z.string().uuid().optional(),
  tableName: z.string().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { tableName, connectionId } }) => ({
    connectionId,
    tableName
  }),
  loader: async ({ deps: { connectionId } }) => {
    let connName = ""
    if (connectionId) {
      const connectionDetailsResult =
        await commands.getConnectionDetails(connectionId)
      const connectionDetails = unwrapResult(connectionDetailsResult)

      if (!connectionDetails) throw redirect({ to: "/connections" })
      connName = connectionDetails.connName
    } else {
      connName = "Temp Connection"
    }

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
  const searchParams = Route.useSearch()
  const keybindingsManager = useKeybindings()
  const [tables, setTables] = useState<string[]>(data.tables)
  const [, setSideBarCollapsed] = useState(false)
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null)

  useEffect(() => {
    keybindingsManager.registerKeybindings([
      {
        command: "focusSearch",
        handler: () => focusSearch()
      }
    ])
  }, [keybindingsManager])

  const handleTableSearch = (searchPattern: string) => {
    if (searchPattern === "") return setTables(data!.tables)

    const filteredTables = tables.filter((table) =>
      table.includes(searchPattern)
    )
    setTables(filteredTables)
  }

  const debounced = useDebounceCallback(handleTableSearch)

  return (
    <ResizablePanelGroup
      className="flex h-full w-full"
      direction="horizontal"
      autoSaveId={"@tablex/layout"}
    >
      <ResizablePanel
        ref={sidebarPanelRef}
        defaultSize={14}
        onExpand={() => setSideBarCollapsed(false)}
        onCollapse={() => setSideBarCollapsed(true)}
        collapsible
        minSize={12}
        collapsedSize={0}
        className={cn(
          "flex flex-col items-start justify-between bg-zinc-800 p-4 pt-2 transition-all lg:p-6",
          sidebarPanelRef.current?.isCollapsed() && "w-0 p-0 lg:w-0 lg:p-0"
        )}
      >
        <div
          className={cn(
            "mb-4 flex w-full flex-col items-start gap-y-4 overflow-y-auto overflow-x-hidden transition-all lg:gap-y-5",
            sidebarPanelRef.current?.isCollapsed() && "hidden"
          )}
        >
          <div className="flex w-full items-center justify-between">
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
            <Button
              variant={"ghost"}
              className="hover:bg-muted-foreground/20 -mb-2 h-6 p-2"
              onClick={() => sidebarPanelRef.current?.collapse()}
            >
              <PanelLeftClose className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
          <h1 className="w-full text-center text-lg font-bold text-gray-500">
            {data!.connName}
          </h1>
          <div className="flex w-full items-center justify-center rounded-sm px-1">
            <Input
              id="search_input"
              onChange={(e) => debounced(e.currentTarget.value)}
              placeholder="Search..."
              className="h-6 border-none text-sm transition-all placeholder:text-xs focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-8 lg:w-[170px] lg:placeholder:text-base lg:focus:w-full"
            />
          </div>
          <div className="mb-4 w-full overflow-y-auto">
            <ul className="flex w-full flex-col items-start gap-y-1 overflow-y-auto">
              {tables.map((table, index) => {
                return (
                  <Link
                    to="/dashboard/$tableName"
                    params={{
                      tableName: table
                    }}
                    search={{
                      connectionId: deps.connectionId,
                      tableName: table
                    }}
                    preload={false}
                    key={index}
                    className={cn(
                      "hover:bg-muted-foreground/30 flex w-full items-center gap-x-1 overflow-x-hidden rounded-md p-1 text-sm text-white lg:text-base",
                      searchParams.tableName === table &&
                        "bg-muted-foreground/30"
                    )}
                    role="button"
                  >
                    <Table className="h-4 w-4 fill-amber-600 text-black" />
                    <p className="flex items-center justify-center">{table}</p>
                  </Link>
                )
              })}
            </ul>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      {deps.tableName && !sidebarPanelRef.current?.isCollapsed() && (
        <AddRowBtn tableName={deps.tableName} />
      )}
      <ResizablePanel>{tables.length > 0 && <Outlet />}</ResizablePanel>
      <CommandPalette />
      <PreferencesDialog />
      <MetaXDialog />
    </ResizablePanelGroup>
  )
}

export default DashboardLayout
