import { SidebarProvider } from "@/components/ui/sidebar"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { TableViewSidebar } from "./-components/table-layout-sidebar"

export const Route = createFileRoute("/_table-layout")({
  component: TableViewLayout
})

function TableViewLayout() {
  return (
    <SidebarProvider>
      <TableViewSidebar />
      <main className="flex h-full w-full flex-col">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
