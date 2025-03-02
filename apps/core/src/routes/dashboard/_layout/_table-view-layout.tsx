import { TableSelectionBreadCrumb } from "@/features/table-view/components/table-selection-breadcrumb"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/_table-view-layout")({
  component: () => (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between p-4"
        id="table-view-layout"
      >
        <TableSelectionBreadCrumb />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
})
