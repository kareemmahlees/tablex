import type { ColumnProps, TxError } from "@/bindings"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { Drivers, type ConnectionStringParams } from "./types"

/**
 * creates connection string for the specified driver accordingly
 * @returns connection string
 */
export function constructConnectionString(params: ConnectionStringParams) {
  let connString = ""
  switch (params.driver) {
    case Drivers.SQLite:
      connString = `${params.driver}:${params.filePath}`
      break
    case Drivers.PostgreSQL:
      connString = `${params.driver}://${params.username}:${params.password}@${params.host}:${params.port}/${params.db}?sslmode=disable`
      break
    case Drivers.MySQL:
      connString = `${params.driver}://${params.username}:${params.password}@${params.host}:${params.port}/${params.db}`
      break
  }
  return connString
}

export type Result<T extends any | null> =
  | { status: "ok"; data: T }
  | { status: "error"; error: TxError }

export function customToast<T extends string>(
  commandResult: Result<T>,
  onSuccess: () => void,
  id?: string
) {
  if (commandResult.status === "error") {
    return toast.custom(
      <div>
        <p>{commandResult.error.message}</p>
        <Button variant={"link"} size={"sm"}>
          more
        </Button>
      </div>
    )
  }
  onSuccess()

  toast.success(commandResult.data, { id })
}

/**
 * Accepts a result returning the inner data or throws an Error.
 * @param result Result of executing a Tauri command.
 * @returns The inner data of the `Ok`
 */
export function unwrapResult<T>(result: Result<T>) {
  if (result.status === "error") {
    customToast(result, () => {})
    throw new Error(result.error.kind)
  }
  return result.data
}

/**
 * @see https://github.com/orgs/react-hook-form/discussions/1991#discussioncomment-31308
 */
export function dirtyValues(
  dirtyFields: object | boolean,
  allValues: object
): object {
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [
      key,
      dirtyValues(dirtyFields[key], allValues[key])
    ])
  )
}

/**
 * Determine wether the given column's data type is supported or not.
 */
export const isUnsupported = (columns: ColumnProps[], colName: string) => {
  return findColumn(columns, colName)?.type == "unsupported"
}

export const findColumn = (columns: ColumnProps[], colName: string) => {
  return columns.find((col) => col.columnName === colName)
}
