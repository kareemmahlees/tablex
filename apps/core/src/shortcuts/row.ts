import { deleteRowsCmd } from "@/commands/row"
import type { Row, Table } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

export const deleteRowsHandler = async (
  table: Table<any>,
  tableName: string,
  contextMenuRow?: Row<any>
) => {
  return deleteRowsCmd(table, tableName, contextMenuRow)
}

export const selectAllRowsHandler = (table: Table<any>) => {
  table.toggleAllRowsSelected(!table.getIsAllRowsSelected())
}

export const copyRows = async (rows: Row<any>[]) => {
  if (rows.length === 0) return
  return await writeText(
    rows
      .map((row) =>
        row
          .getAllCells()
          .slice(1)
          .map((cell) => cell.getValue())
          .join("|")
      )
      .join("\n")
  )
}
