import { commands } from "@/bindings"
import { customToast } from "@tablex/lib/utils"
import type { QueryClient } from "@tanstack/react-query"
import type { Row, Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { Dispatch, SetStateAction } from "react"
import toast from "react-hot-toast"

export const createRowCmd = async (
  tableName: string,
  data: Record<string, any>,
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>,
  queryClient: QueryClient
) => {
  const commandResult = await commands.createRow(tableName, data)

  customToast(
    commandResult,
    (s) => {
      setIsSheetOpen(false)
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
      return `Successfully created ${s} row`
    },
    "create_row"
  )
}

export const deleteRowsCmd = async (
  table: Table<any>,
  tableName: string,
  queryClient: QueryClient,
  contextMenuRow?: Row<any>
) => {
  const column = table.getColumn("pk")
  if (!column)
    return toast.error("Table Doesn't have a primary key", {
      id: "table_pk_error"
    })

  let rowPkValues: any[] = []

  if (table.getIsSomeRowsSelected()) {
    const rows = table
      .getSelectedRowModel()
      .rows.map((row) => row.getValue(column.id))

    if (rows.length <= 0) return

    rowPkValues = rows
  } else if (contextMenuRow) {
    rowPkValues = [contextMenuRow.getValue("pk")]
  }

  const command = await commands.deleteRows(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    column.columnDef.meta?.name!,
    rowPkValues,
    tableName
  )
  customToast(
    command,
    (rowsAffected) => {
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
      return `Successfully deleted ${
        rowsAffected === 1 ? "1 row" : rowsAffected + " rows"
      }`
    },
    "delete_row"
  )
  table.toggleAllRowsSelected(false)
}

export const updateRowCmd = async (
  tableName: string,
  pkColName: string,
  pkColValue: string | number,
  data: Record<string, any>,
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
) => {
  const command = await commands.updateRow(
    tableName,
    pkColName,
    pkColValue,
    data
  )
  customToast(
    command,
    () => {
      setIsSheetOpen(false)
      return `Successfully updated rows`
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
