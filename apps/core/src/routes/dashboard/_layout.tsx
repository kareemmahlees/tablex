import { commands } from "@/bindings"
import MetaXDialog from "@/components/dialogs/metax-dialog"
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
    <SidebarProvider>
      <AppSidebar />
      {/* {deps.tableName && <AddRowBtn tableName={deps.tableName} />} */}
      <main className="w-full">
        <Outlet />
      </main>
      <MetaXDialog />
    </SidebarProvider>
  )
}

export default DashboardLayout
