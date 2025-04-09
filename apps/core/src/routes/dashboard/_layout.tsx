import { commands } from "@/bindings"
import { SidebarProvider } from "@/components/ui/sidebar"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { z } from "zod"
import AppSidebar from "./-components/app-sidebar"

const dashboardConnectionSchema = z.object({
  connectionId: z.string().uuid().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { connectionId } }) => ({
    connectionId
  }),
  loader: async ({ deps: { connectionId } }) => {
    let connName = ""
    if (connectionId) {
      const connectionDetails =
        await commands.getConnectionDetails(connectionId)

      connName = connectionDetails.connName
    } else {
      connName = "Temp Connection"
    }

    return { connName }
  },
  onLeave: async () => await commands.killMetax(),
  component: DashboardLayout
})

function DashboardLayout() {
  // const data = Route.useLoaderData()
  // const [tables, _] = useState<string[]>(data.tables)

  return (
    <SidebarProvider className="h-full">
      <AppSidebar />
      {/* {deps.tableName && <AddRowBtn tableName={deps.tableName} />} */}
      <main className="h-full w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout
