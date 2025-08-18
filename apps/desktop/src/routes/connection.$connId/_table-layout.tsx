import { commands } from "@/bindings"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { DBSchemaContext } from "@/features/common/db-context"
import {
  TableSelectionBreadCrumb,
  TableSelectionSkeleton
} from "@/features/table-view/components/table-selection-breadcrumb"
import { LOCAL_STORAGE } from "@/lib/constants"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { LucideIcon, PanelLeft, PanelLeftClose } from "lucide-react"
import { Suspense } from "react"
import { useLocalStorage } from "usehooks-ts"
import { TableViewSidebar } from "../-components/table-layout-sidebar"

export const Route = createFileRoute("/connection/$connId/_table-layout")({
  loader: async ({ params: { connId } }) => {
    const [dbSchema, connDetails] = await Promise.all([
      commands.discoverDbSchema(),
      commands.getConnectionDetails(connId)
    ])
    return { dbSchema, connName: connDetails.connName }
  },
  component: TableViewLayout,
  staleTime: 10 * 60 * 1000 // 1 hour
})

function TableViewLayout() {
  const { connId } = Route.useParams()
  const { dbSchema, connName } = Route.useLoaderData()
  const [sidebarOpen, setSidebarOpen] = useLocalStorage(
    LOCAL_STORAGE.SIDEBAR_OPEN,
    true
  )

  return (
    <SidebarProvider
      className="overflow-hidden"
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <TableViewSidebar />
      <DBSchemaContext.Provider value={dbSchema}>
        <main className="flex h-full w-full min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-x-6 border-b px-4 py-1.5">
            <SidebarToggleIcon />
            <Suspense fallback={<TableSelectionSkeleton />}>
              <TableSelectionBreadCrumb connName={connName} connId={connId} />
            </Suspense>
          </div>
          <Outlet />
        </main>
      </DBSchemaContext.Provider>
    </SidebarProvider>
  )
}

const SidebarToggleIcon = () => {
  const { state, toggleSidebar } = useSidebar()
  let Icon: LucideIcon

  switch (state) {
    case "collapsed":
      Icon = PanelLeft
      break
    case "expanded":
      Icon = PanelLeftClose
      break
  }
  return (
    <button>
      <Icon
        className="text-muted-foreground size-4 transition-colors hover:text-white"
        onClick={toggleSidebar}
      />
    </button>
  )
}
