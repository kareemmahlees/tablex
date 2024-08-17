import { create } from "zustand"

export type TableState = {
  tableName: string
  pkColumn?: string
  updateTableName: (tableName: TableState["tableName"]) => void
  updatePkColumn: (pkColumn: TableState["pkColumn"]) => void
}

export const useTableState = create<TableState>((set) => ({
  tableName: "",
  pkColumn: undefined,
  updateTableName: (tableName) => set(() => ({ tableName })),
  updatePkColumn: (pkColumn) => set(() => ({ pkColumn }))
}))
