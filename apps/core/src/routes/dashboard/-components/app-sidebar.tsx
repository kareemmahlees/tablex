import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import { About } from "@/features/about/about"
import CommandPalette from "@/features/command-palette/palette"
import {
  FileRoutesByPath,
  getRouteApi,
  Link,
  useRouter,
  useRouterState
} from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Keyboard,
  LucideIcon,
  RotateCw,
  Settings,
  StickyNote,
  Table2,
  Terminal
} from "lucide-react"

type Routes = FileRoutesByPath[keyof FileRoutesByPath]["fullPath"]

type SidebarItem =
  | {
      type: "single"
      title: string
      icon?: LucideIcon
      url: Routes
    }
  | {
      type: "collapsible"
      title: string
      icon?: LucideIcon
      items: {
        title: string
        url: Routes
      }[]
    }

const items: SidebarItem[] = [
  {
    type: "single",
    title: "Tables",
    url: "/dashboard/table-view/land",
    icon: Table2
  },
  {
    type: "single",
    title: "SQL Editor",
    url: "/dashboard/sql-editor",
    icon: Terminal
  },
  {
    type: "single",
    title: "API Docs",
    url: `/dashboard/api-docs`,
    icon: StickyNote
  },
  {
    type: "single",
    title: "Keybindings",
    url: `/dashboard/keybindings`,
    icon: Keyboard
  },
  {
    type: "collapsible",
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences"
      }
    ]
  }
]

const AppSidebar = () => {
  const router = useRouter()
  const location = useRouterState({ select: (s) => s.location })
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
              {items.map((item, index) => {
                if (item.type === "single") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="lg:h-9"
                        isActive={location.pathname === item.url}
                        asChild
                      >
                        <Link
                          to={item.url}
                          search={{ connectionId: search.connectionId }}
                        >
                          {item.icon && <item.icon />}
                          <span className="lg:text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                } else if (item.type === "collapsible") {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={index === 1}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="flex items-center justify-between">
                            {item.icon && <item.icon />}
                            {item.title}{" "}
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((item) => (
                              <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location.pathname === item.url}
                                >
                                  <Link
                                    to={item.url}
                                    search={{
                                      connectionId: search.connectionId
                                    }}
                                  >
                                    {item.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }
              })}
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
