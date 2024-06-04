import type { Row } from "@tanstack/react-table"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

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
