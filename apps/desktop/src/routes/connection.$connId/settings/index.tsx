import { Preferences } from "@/features/settings/preferences"
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
import { Keyboard, Settings2 } from "lucide-react"

export const Route = createFileRoute("/connection/$connId/settings/")({
  component: RouteComponent
})

const items: SidebarItem[] = [
  {
    type: "single",
    title: "Preferences",
    icon: Settings2,
    url: "/connection/$connId/settings/preferences"
  },
  {
    type: "single",
    title: "Keybindings",
    url: "/connection/$connId/settings/keybindings",
    icon: Keyboard
  }
]

function RouteComponent() {
  const matchRoute = useMatchRoute()
  return (
    <>
      <Sidebar>
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
      <Outlet />
    </>
  )
}
