import { SidebarProvider } from "@/components/ui/sidebar"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SettingsSideBar } from "./-components/settings-layout-sidebar"

export const Route = createFileRoute("/_settings-layout")({
  component: SettingsLayout
})

function SettingsLayout() {
  return (
    <SidebarProvider>
      <SettingsSideBar />
      <main className="flex h-full w-full flex-col">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
