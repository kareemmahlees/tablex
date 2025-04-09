import { TableSelectionBreadCrumb } from "@/features/table-view/components/table-selection-breadcrumb"
import { getConnectionDetailsQueryOptions } from "@/features/table-view/queries"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/_table-view-layout")({
  loaderDeps: ({ search }) => ({ connectionId: search.connectionId }),
  loader: ({ context: { queryClient }, deps: { connectionId } }) =>
    queryClient.ensureQueryData(
      getConnectionDetailsQueryOptions(connectionId!)
    ),
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
      </div>
      <Outlet />
    </div>
  )
}
