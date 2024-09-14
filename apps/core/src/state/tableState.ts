import { create } from "zustand"

export type TableState = {
  tableName: string
  pkColumn?: string
  globalFilter: string
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setGlobalFilter: (globalFilter: string) => void
  updateTableName: (tableName: TableState["tableName"]) => void
  updatePkColumn: (pkColumn: TableState["pkColumn"]) => void
}

export const useTableState = create<TableState>((set) => ({
  tableName: "",
  pkColumn: undefined,
  globalFilter: "",
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) =>
    set(() => ({ sidebarCollapsed: collapsed })),
  setGlobalFilter: (globalFilter) => set(() => ({ globalFilter })),
  updateTableName: (tableName) => set(() => ({ tableName })),
  updatePkColumn: (pkColumn) => set(() => ({ pkColumn }))
}))
