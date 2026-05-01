import { SidebarItem } from "@/types"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@tablex/ui/components/sidebar"

import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute
} from "@tanstack/react-router"
import {
  LifeBuoy,
  Settings,
  TablePropertiesIcon,
  TextCursor
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
    icon: TextCursor
  },
  {
    type: "single",
    title: "Utilities",
    url: "/connection/$connId/utilities",
    icon: LifeBuoy
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
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
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
                        isActive={
                          matchRoute({ to: item.url, fuzzy: true }) !== false
                        }
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
      <main className="flex-1">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
