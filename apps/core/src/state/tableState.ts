import { create } from "zustand"

export type TableState = {
  tableName: string
  pkColumn?: string
  globalFilter: string
  setGlobalFilter: (globalFilter: string) => void
  updateTableName: (tableName: TableState["tableName"]) => void
  updatePkColumn: (pkColumn: TableState["pkColumn"]) => void
}

export const useTableState = create<TableState>((set) => ({
  tableName: "",
  pkColumn: undefined,
  globalFilter: "",
  setGlobalFilter: (globalFilter) => set(() => ({ globalFilter })),
  updateTableName: (tableName) => set(() => ({ tableName })),
  updatePkColumn: (pkColumn) => set(() => ({ pkColumn }))
}))
