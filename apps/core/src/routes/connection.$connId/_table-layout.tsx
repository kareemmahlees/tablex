import { SidebarProvider } from "@/components/ui/sidebar"
import {
  TableSelectionBreadCrumb,
  TableSelectionSkeleton
} from "@/features/table-view/components/table-selection-breadcrumb"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { createFileRoute, Outlet } from "@tanstack/react-router"
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
    <SidebarProvider>
      <TableViewSidebar />
      <main className="flex h-full w-full flex-col">
        <div className="border-b px-4 py-1.5">
          <Suspense fallback={<TableSelectionSkeleton />}>
            <TableSelectionBreadCrumb connId={connId} />
          </Suspense>
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
