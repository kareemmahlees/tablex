import { commands } from "@/bindings"
import CommandPalette from "@/components/dialogs/command-palette-dialog"
import MetaXDialog from "@/components/dialogs/metax-dialog"
import PreferencesDialog from "@/components/dialogs/preferences/preferences-dilaog"
import AddRowBtn from "@/components/sheets/create-row-sheet"
import { SidebarProvider } from "@/components/ui/sidebar"
import { focusSearch } from "@/keybindings"
import { useKeybindings } from "@/keybindings/manager"
import { unwrapResult } from "@/lib/utils"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import AppSidebar from "./-components/app-sidebar"

const dashboardConnectionSchema = z.object({
  connectionId: z.string().uuid().optional(),
  tableName: z.string().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { tableName, connectionId } }) => ({
    connectionId,
    tableName
  }),
  loader: async ({ deps: { connectionId } }) => {
    let connName = ""
    if (connectionId) {
      const connectionDetailsResult =
        await commands.getConnectionDetails(connectionId)
      const connectionDetails = unwrapResult(connectionDetailsResult)

      if (!connectionDetails) throw redirect({ to: "/connections" })
      connName = connectionDetails.connName
    } else {
      connName = "Temp Connection"
    }

    const tables = unwrapResult(await commands.getTables())
    if (!tables)
      throw redirect({
        to: "/connections"
      })

    return { connName, tables }
  },
  onLeave: async () => unwrapResult(await commands.killMetax()),
  component: DashboardLayout
})

function DashboardLayout() {
  const deps = Route.useLoaderDeps()
  const data = Route.useLoaderData()
  const [tables, _] = useState<string[]>(data.tables)
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
      {deps.tableName && <AddRowBtn tableName={deps.tableName} />}
      {tables.length > 0 && <Outlet />}
      <CommandPalette />
      <PreferencesDialog />
      <MetaXDialog />
    </SidebarProvider>
  )
}

export default DashboardLayout
