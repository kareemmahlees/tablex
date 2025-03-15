import { commands } from "@/bindings"
import MetaXDialog from "@/components/dialogs/metax-dialog"
import { SidebarProvider } from "@/components/ui/sidebar"
import { focusSearch } from "@/keybindings"
import { useKeybindings } from "@/keybindings/manager"
import { unwrapResult } from "@/lib/utils"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
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
      const connectionDetailsResult =
        await commands.getConnectionDetails(connectionId)
      const connectionDetails = unwrapResult(connectionDetailsResult)

      connName = connectionDetails.connName
    } else {
      connName = "Temp Connection"
    }

    return { connName }
  },
  onLeave: async () => unwrapResult(await commands.killMetax()),
  component: DashboardLayout
})

function DashboardLayout() {
  // const data = Route.useLoaderData()
  // const [tables, _] = useState<string[]>(data.tables)
  const keybindingsManager = useKeybindings()

  useEffect(() => {
    keybindingsManager.registerKeybindings([
      {
        command: "focusSearch",
        handler: () => focusSearch()
      }
    ])
  }, [keybindingsManager])

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
