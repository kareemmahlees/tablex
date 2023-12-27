import { customToast } from "@/lib/utils"
import { type QueryClient } from "@tanstack/react-query"
import type { Row, Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/api/clipboard"
import { register } from "@tauri-apps/api/globalShortcut"
import { invoke } from "@tauri-apps/api/tauri"
import type { Dispatch, SetStateAction } from "react"
import toast from "react-hot-toast"

export const getRows = async (tableName: string) => {
  return await invoke<Record<string, any>[]>("get_rows", { tableName })
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
  customToast(command, {
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
  pkColName: string,
  pkColValue: string | number,
  data: Record<string, any>,
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
) => {
  const command = invoke("update_row", {
    tableName,
    pkColName,
    pkColValue,
    data
  })
  customToast(command, {
    success: (s) => {
      setIsSheetOpen(false)
      return `Successfully updated rows`
    },
    error: (e: string) => e
  })
}

export const copyRowIntoClipboard = async (
  table: Table<any>,
  contextMenuRow?: Row<any>
) => {
  if (contextMenuRow) {
    const row_values = contextMenuRow
      .getAllCells()
      .slice(1)
      .map((cell) => cell.getValue())
    return await writeText(row_values.join("|"))
  } else if (table.getIsSomeRowsSelected()) {
    return await writeText(
      table
        .getSelectedRowModel()
        .rows!.map((row) =>
          row
            .getAllCells()
            .slice(1)
            .map((cell) => cell.getValue())
            .join("|")
        )
        .join("\n")
    )
  }
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

export const registerSelectAllShortcut = (table: Table<any>) => {
  register("CommandOrControl+A", () => {
    table.toggleAllRowsSelected(!table.getIsAllRowsSelected())
  })
}

export const registerCopyShortcut = (
  table: Table<any>,
  contextMenuRow?: Row<any>
) => {
  register("CommandOrControl+C", () =>
    copyRowIntoClipboard(table, contextMenuRow)
  )
}
