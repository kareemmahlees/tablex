import { commands } from "@/bindings"
import { customToast } from "@/lib/utils"
import type { Row } from "@tanstack/react-table"
import toast from "react-hot-toast"

export const createRowCmd = async (
  tableName: string,
  data: Record<string, any>,
  toggleSheet: (open: boolean) => void
) => {
  const commandResult = await commands.createRow(tableName, data)

  customToast(commandResult, () => toggleSheet(false), "create_row")
}

export const deleteRowsCmd = async (
  tableName: string,
  rows: Row<any>[],
  pkColumn?: string
) => {
  if (!pkColumn)
    return toast.error("Table Doesn't have a primary key", {
      id: "table_pk_error"
    })

  const command = await commands.deleteRows(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    pkColumn,
    rows.map((row) => row.getValue(pkColumn)),
    tableName
  )
  customToast(command, () => {}, "delete_row")
}

export const updateRowCmd = async (
  tableName: string,
  pkColName: string,
  pkColValue: string | number,
  data: Record<string, any>,
  toggleSheet: (open: boolean) => void
) => {
  const command = await commands.updateRow(
    tableName,
    pkColName,
    pkColValue,
    data
  )
  customToast(command, () => toggleSheet(false), "update_row")
}
