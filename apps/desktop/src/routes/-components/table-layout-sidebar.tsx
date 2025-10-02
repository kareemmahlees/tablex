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
import { SidebarItem } from "@/types"
import {
  Link,
  useMatchRoute,
  useParams,
  useRouter
} from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  RotateCw,
  Settings,
  StickyNote,
  Table2,
  Terminal
} from "lucide-react"

const items: SidebarItem[] = [
  {
    type: "single",
    title: "Tables",
    url: "/connection/$connId/table-view/empty",
    icon: Table2
  },
  {
    type: "single",
    title: "SQL Editor",
    url: "/connection/$connId/sql-editor",
    icon: Terminal
  },
  {
    type: "single",
    title: "Utilities",
    url: `/connection/$connId/utilities`,
    icon: StickyNote
  }
]

export const TableViewSidebar = () => {
  const router = useRouter()
  const matchRoute = useMatchRoute()
  const { connId } = useParams({ strict: false })
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
            className="hover:bg-muted-foreground/20 h-6 w-fit px-1 py-2"
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
                        isActive={matchRoute({ to: item.url }) !== false}
                        asChild
                      >
                        <Link to={item.url} params={{ connId }}>
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
                                  isActive={
                                    matchRoute({ to: item.url }) !== false
                                  }
                                >
                                  <Link to={item.url} params={{ connId }}>
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
      <SidebarFooter className="flex flex-row items-center justify-between">
        <SidebarMenuButton asChild className="w-fit">
          <Link to="/settings/preferences">
            <Settings />
          </Link>
        </SidebarMenuButton>
        <About />
      </SidebarFooter>
    </Sidebar>
  )
}
