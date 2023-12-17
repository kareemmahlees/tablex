import { type QueryClient } from "@tanstack/react-query"
import { Table } from "@tanstack/react-table"
import { register } from "@tauri-apps/api/globalShortcut"
import { invoke } from "@tauri-apps/api/tauri"
import { type Dispatch, type SetStateAction } from "react"
import toast from "react-hot-toast"

export const getRows = async (tableName: string) => {
  return await invoke<Record<string, any>[]>("get_rows", { tableName })
}

export const getColumns = async (tableName: string) => {
  return await invoke<string[]>("get_columns", { tableName })
}

export const deleteRows = async (
  table: Table<any>,
  tableName: string,
  queryClient: QueryClient
) => {
  const column = table.getColumn("pk")
  if (!column)
    return toast.error("Table Doesn't have a primary key", {
      id: "table_pk_error"
    })

  const rows = table
    .getSelectedRowModel()
    .rows.map((row) => row.getValue(column.id))

  if (rows.length <= 0) return

  const command = invoke<number>("delete_rows", {
    pkColName: column.columnDef.meta?.name,
    rowPkValues: rows,
    tableName
  })
  toast.promise(command, {
    loading: "Deleting...",
    success: (rowsAffected) => {
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
      return `Successfully deleted ${
        rowsAffected === 1 ? "1 row" : rowsAffected + " rows"
      }`
    },
    error: (err: string) => err
  })
  table.toggleAllRowsSelected(false)
}

export const updateRow = async (
  tableName: string,
  pkValue: any,
  data: Record<string, any>,
  setOpenSheet: Dispatch<SetStateAction<boolean>>
) => {
  const command = invoke("update_row", { tableName, pkValue, data })
  toast.promise(command, {
    loading: "Updating...",
    success: (s) => {
      setOpenSheet(false)
      return `Successfully updated rows`
    },
    error: (e: string) => e
  })
}

export const registerDeleteShortcut = (
  table: Table<any>,
  tableName: string,
  queryClient: QueryClient
) => {
  register(
    "Delete",
    async () => await deleteRows(table, tableName, queryClient)
  )
}
