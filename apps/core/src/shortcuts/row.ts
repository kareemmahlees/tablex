import { customToast } from "@/lib/utils"
import type { QueryClient } from "@tanstack/react-query"
import type { Row, Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/api/clipboard"
import { invoke } from "@tauri-apps/api/tauri"
import toast from "react-hot-toast"

export const deleteRowsHandler = async (
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
        queryClient.invalidateQueries({ queryKey: ["table_rows"] })
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

export const selectAllRowsHandler = (table: Table<any>) => {
  table.toggleAllRowsSelected(!table.getIsAllRowsSelected())
}

export const copyRowsIntoClipboard = async (
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
