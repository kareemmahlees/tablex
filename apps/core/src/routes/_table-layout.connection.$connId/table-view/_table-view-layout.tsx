import { Button } from "@/components/ui/button"
import { TableSelectionBreadCrumb } from "@/features/table-view/components/table-selection-breadcrumb"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ArrowDownUp } from "lucide-react"

export const Route = createFileRoute(
  "/_table-layout/connection/$connId/table-view/_table-view-layout"
)({
  loader: async ({ context: { queryClient }, params: { connId } }) => {
    await Promise.all([
      queryClient.prefetchQuery(getTablesQueryOptions(connId)),
      queryClient.prefetchQuery(getConnectionDetailsQueryOptions(connId))
    ])
  },
  component: TableViewLayout
})

function TableViewLayout() {
  const connId = Route.useParams({ select: (s) => s.connId })

  return (
    <div className="flex h-full w-full flex-1 flex-grow flex-col">
      <div className="flex w-full items-center justify-between p-4">
        <TableSelectionBreadCrumb connId={connId} />
        <Button size={"sm"} variant={"outline"} className="h-8 space-x-2">
          <ArrowDownUp className="size-4" />
          <span>Sort</span>
        </Button>
      </div>
      <Outlet />
    </div>
  )
}
