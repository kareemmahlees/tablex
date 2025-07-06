import type { FileRoutesByPath } from "@tanstack/react-router"
import { LucideIcon } from "lucide-react"

export type TableLocalStorage = {
  tableName: string
  pageIndex: number
}

type Routes = FileRoutesByPath[keyof FileRoutesByPath]["fullPath"]

export type SidebarItem =
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
