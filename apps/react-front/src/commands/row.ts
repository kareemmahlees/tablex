import type { PaginatedRows } from "@/lib/types"
import { customToast } from "@/lib/utils"
import type { Router } from "@tanstack/react-router"
import type { Row, Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/api/clipboard"
import { invoke } from "@tauri-apps/api/tauri"
import { Dispatch, SetStateAction } from "react"
import toast from "react-hot-toast"

export const getPaginatedRows = async (
  tableName: string,
  pageIndex: number,
  pageSize: number
) => {
  const result = await invoke<PaginatedRows>("get_paginated_rows", {
    tableName,
    pageIndex,
    pageSize
  })
  return result
}

export const deleteRows = async (
  table: Table<any>,
  tableName: string,
  router: Router,
  contextMenuRow?: Row<any>
) => {
  const column = table.getColumn("pk")
  if (!column)
    return toast.error("Table Doesn't have a primary key", {
      id: "table_pk_error"
    })

  const command_options: { [k: string]: any } = {
    pkColName: column.columnDef.meta?.name,
    tableName
  }

  if (table.getIsSomeRowsSelected()) {
    const rows = table
      .getSelectedRowModel()
      .rows.map((row) => row.getValue(column.id))

    if (rows.length <= 0) return

    command_options.rowPkValues = rows
  } else if (contextMenuRow) {
    command_options.rowPkValues = [contextMenuRow.getValue("pk")]
  }

  const command = invoke<number>("delete_rows", command_options)
  customToast(
    command,
    {
      success: (rowsAffected) => {
        router.invalidate()
        return `Successfully deleted ${
          rowsAffected === 1 ? "1 row" : rowsAffected + " rows"
        }`
      },
      error: (err: string) => err
    },
    "delete_row"
  )
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
  customToast(
    command,
    {
      success: () => {
        setIsSheetOpen(false)
        return `Successfully updated rows`
      },
      error: (e: string) => e
    },
    "update_row"
  )
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
