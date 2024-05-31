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
