import CommandPalette from "@/components/dialogs/command-palette-dialog"
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
import { FileRoutesByPath, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Info,
  Keyboard,
  LucideIcon,
  Settings,
  StickyNote,
  Table2,
  Terminal
} from "lucide-react"

type Routes = FileRoutesByPath[keyof FileRoutesByPath]["fullPath"]

const items: { title: string; url: Routes; icon: LucideIcon }[] = [
  {
    title: "Tables",
    url: "/dashboard/table-view/land",
    icon: Table2
  },
  {
    title: "SQL Editor",
    url: "/dashboard/sql-editor",
    icon: Terminal
  },
  {
    title: "API Docs",
    url: `/dashboard/api-docs`,
    icon: StickyNote
  },
  {
    title: "Keybindings",
    url: `/dashboard/keybindings`,
    icon: Keyboard
  },
  {
    title: "Settings",
    url: `/dashboard/settings`,
    icon: Settings
  }
]

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="space-y-1.5">
        <Link
          to="/connections"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group/arrow hover:bg-muted-foreground/20 group -mb-2 h-6 w-fit p-2"
          )}
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover/arrow:-translate-x-1"
            color="gray"
          />
        </Link>
        <CommandPalette />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="lg:h-9" asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span className="lg:text-base">{item.title}</span>
                    </Link>
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
