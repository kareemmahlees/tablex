import { Button } from "@/components/ui/button"
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
import { About } from "@/features/about/about"
import CommandPalette from "@/features/command-palette/palette"
import {
  FileRoutesByPath,
  getRouteApi,
  Link,
  useRouter
} from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Keyboard,
  LucideIcon,
  RotateCw,
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
  const router = useRouter()
  const search = getRouteApi("/dashboard/_layout").useSearch()
  return (
    <Sidebar>
      <SidebarHeader className="space-y-1.5">
        <div className="flex w-full items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className={
                "hover:bg-muted-foreground/20 -mb-2 h-6 w-fit px-1 py-2"
              }
              onClick={() => router.history.back()}
            >
              <ArrowLeft className="h-4 w-4" color="gray" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={
                "hover:bg-muted-foreground/20 -mb-2 h-6 w-fit px-1 py-2"
              }
              onClick={() => router.history.forward()}
            >
              <ArrowRight className="h-4 w-4" color="gray" />
            </Button>
          </div>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="hover:bg-muted-foreground/20 -mb-2 h-6 w-fit px-1 py-2"
            onClick={() => window.location.reload()}
          >
            <RotateCw className="h-4 w-4" color="gray" />
          </Button>
        </div>
        <CommandPalette />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="lg:h-9" asChild>
                    <Link
                      to={item.url}
                      search={{ connectionId: search.connectionId }}
                    >
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
        <About />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
