import { Button } from "@/components/ui/button"
import { TableSelectionBreadCrumb } from "@/features/table-view/components/table-selection-breadcrumb"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ArrowDownUp } from "lucide-react"

export const Route = createFileRoute("/dashboard/_layout/_table-view-layout")({
  loaderDeps: ({ search }) => ({ connectionId: search.connectionId }),
  loader: async ({ context: { queryClient }, deps: { connectionId } }) => {
    await Promise.all([
      queryClient.prefetchQuery(getTablesQueryOptions(connectionId!)),
      queryClient.prefetchQuery(getConnectionDetailsQueryOptions(connectionId!))
    ])
  },

  component: TableViewLayout
})

function TableViewLayout() {
  const { connectionId } = Route.useSearch()

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between p-4"
        id="table-view-layout"
      >
        <TableSelectionBreadCrumb connectionId={connectionId!} />
        <Button size={"sm"} variant={"outline"} className="h-8 space-x-2">
          <ArrowDownUp className="size-4" />
          <span>Sort</span>
        </Button>
      </div>
      <Outlet />
    </div>
  )
}
