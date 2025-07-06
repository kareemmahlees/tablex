import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import {
  TableSelectionBreadCrumb,
  TableSelectionSkeleton
} from "@/features/table-view/components/table-selection-breadcrumb"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { PanelLeft, PanelLeftClose } from "lucide-react"
import { Suspense } from "react"
import { TableViewSidebar } from "../-components/table-layout-sidebar"

export const Route = createFileRoute("/connection/$connId/_table-layout")({
  loader: async ({ context: { queryClient }, params: { connId } }) => {
    queryClient.prefetchQuery(getTablesQueryOptions(connId))
    queryClient.prefetchQuery(getConnectionDetailsQueryOptions(connId))
  },
  component: TableViewLayout
})

function TableViewLayout() {
  const { connId } = Route.useParams()

  return (
    <SidebarProvider className="overflow-hidden">
      <TableViewSidebar />
      <main className="flex h-full w-full min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-x-6 border-b px-4 py-1.5">
          <SidebarToggleIcon />
          <Suspense fallback={<TableSelectionSkeleton />}>
            <TableSelectionBreadCrumb connId={connId} />
          </Suspense>
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

const SidebarToggleIcon = () => {
  const { state, toggleSidebar } = useSidebar()

  console.log("state", state)

  const renderSidebarToggleIcon = () => {
    switch (state) {
      case "collapsed":
        return (
          <PanelLeft
            className="text-muted-foreground size-4 transition-colors hover:text-white"
            onClick={toggleSidebar}
          />
        )
      case "expanded":
        return (
          <PanelLeftClose
            className="text-muted-foreground size-4 transition-colors hover:text-white"
            onClick={toggleSidebar}
          />
        )
    }
  }

  return <button>{renderSidebarToggleIcon()}</button>
}
