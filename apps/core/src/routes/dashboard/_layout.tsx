import { commands } from "@/bindings"
import MetaXDialog from "@/components/dialogs/metax-dialog"
import PreferencesDialog from "@/components/dialogs/preferences/preferences-dilaog"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getTablesQueryOptions } from "@/features/shared/queries"
import { focusSearch } from "@/keybindings"
import { useKeybindings } from "@/keybindings/manager"
import { unwrapResult } from "@/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
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
  loader: async ({ deps: { connectionId }, context: { queryClient } }) => {
    let connName = ""
    if (connectionId) {
      const connectionDetailsResult =
        await commands.getConnectionDetails(connectionId)
      const connectionDetails = unwrapResult(connectionDetailsResult)

      connName = connectionDetails.connName
    } else {
      connName = "Temp Connection"
    }

    queryClient.ensureQueryData(getTablesQueryOptions)
    return { connName }
  },
  onLeave: async () => unwrapResult(await commands.killMetax()),
  component: DashboardLayout
})

function DashboardLayout() {
  const deps = Route.useLoaderDeps()
  const { data: tables } = useSuspenseQuery(getTablesQueryOptions)
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
      <AppSidebar connectionId={deps.connectionId!} />
      {/* {deps.tableName && <AddRowBtn tableName={deps.tableName} />} */}
      <main className="w-full">{tables.length > 0 && <Outlet />}</main>
      <PreferencesDialog />
      <MetaXDialog />
    </SidebarProvider>
  )
}

export default DashboardLayout
