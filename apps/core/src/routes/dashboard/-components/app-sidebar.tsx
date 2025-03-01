import { buttonVariants } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { cn } from "@tablex/lib/utils"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Info,
  Keyboard,
  Settings,
  StickyNote,
  Table2
} from "lucide-react"

const items = (connectionId: string) => [
  {
    title: "Tables",
    url: `/dashboard/connection/${connectionId}`,
    icon: Table2
  },
  {
    title: "Keybindings",
    url: `/dashboard/keybindings`,
    icon: Keyboard
  },
  {
    title: "API Docs",
    url: `/dashboard/docs`,
    icon: StickyNote
  },
  {
    title: "Settings",
    url: `/dashboard/settings`,
    icon: Settings
  }
]

const AppSidebar = ({ connectionId }: { connectionId: string }) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          to="/connections"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hover:bg-muted-foreground/20 group -mb-2 h-6 w-fit p-2"
          )}
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform hover:-translate-x-1"
            color="gray"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items(connectionId).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="lg:h-9" asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="lg:text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton className="lg:h-9">
          <Info />
          <span className="lg:text-base">{"About"}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
