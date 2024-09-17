import type { ColumnProps, TxError } from "@/bindings"
import ErrorDialog from "@/components/dialogs/error-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@tablex/lib/utils"
import { error } from "@tauri-apps/plugin-log"
import { toast } from "sonner"
import { ConnectionStringParams, Drivers } from "./types"

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
  id?: string,
  onSuccess?: () => void
) {
  if (commandResult.status === "error") {
    error(
      `message: ${commandResult.error.message}, details: ${commandResult.error.details}.`
    )
    return toast.error(commandResult.error.message, {
      action: (
        <ErrorDialog error={commandResult.error.details}>
          <Button
            size={"sm"}
            className={cn(
              "ml-auto hidden",
              commandResult.error.details && "block"
            )}
          >
            more
          </Button>
        </ErrorDialog>
      ),
      position: "bottom-center",
      id
    })
  }
  if (onSuccess) {
    onSuccess()
  }

  toast.success(commandResult.data, { id })
}

/**
 * Accepts a result returning the inner data or returns false that can be checked against.
 * @param result Result of executing a Tauri command.
 * @returns The inner data of the `Ok`
 */
export function unwrapResult<T>(result: Result<T>): false | T {
  if (result.status === "error") {
    customToast(result)
    return false
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
