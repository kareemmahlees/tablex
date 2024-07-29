import { ColumnProps } from "@/bindings"
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

export type Result<T extends any | null, E extends string> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E }

export function customToast<T extends string, E extends string>(
  commandResult: Result<T, E>,
  onSuccess: () => void,
  id?: string
) {
  if (commandResult.status === "error") {
    return toast.error(commandResult.error, { id })
  }
  onSuccess()

  toast.success(commandResult.data, { id })
}

/**
 * Accepts a result returning the inner data or throws an Error.
 * @param result Result of executing a Tauri command.
 * @returns The inner data of the `Ok`
 */
export function unwrapResult<T, E extends string>(result: Result<T, E>) {
  if (result.status === "error") {
    throw new Error(result.error)
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
export const isUnsupported = (columnsProps: ColumnProps[], colName: string) => {
  return (
    columnsProps.find((col) => col.columnName == colName)?.type == "unsupported"
  )
}
