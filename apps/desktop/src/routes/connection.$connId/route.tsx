import { SidebarItem } from "@/types"
import { Button } from "@tablex/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@tablex/ui/components/sidebar"
import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute,
  useRouter
} from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Keyboard,
  RotateCw,
  Settings,
  TablePropertiesIcon
} from "lucide-react"

export const Route = createFileRoute("/connection/$connId")({
  component: RouteComponent
})

const items: SidebarItem[] = [
  {
    type: "single",
    title: "Table Editor",
    icon: TablePropertiesIcon,
    url: "/connection/$connId/editor"
  },
  {
    type: "single",
    title: "SQL Editor",
    url: "/connection/$connId/sql",
    icon: Keyboard
  },
  {
    type: "single",
    title: "Settings",
    url: "/connection/$connId/settings",
    icon: Settings
  }
]

function RouteComponent() {
  const matchRoute = useMatchRoute()
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      >
        <Sidebar
          collapsible="none"
          className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => {
                    if (item.type !== "single") return
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className="lg:h-9"
                          tooltip={{
                            children: item.title,
                            hidden: false
                          }}
                          isActive={matchRoute({ to: item.url }) !== false}
                          asChild
                        >
                          <Link to={item.url}>
                            {item.icon && <item.icon />}
                            <span className="lg:text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </Sidebar>
      <main className="flex h-full w-full flex-col">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
