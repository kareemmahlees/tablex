import type { TxError } from "@/bindings"
import ErrorDialog from "@/components/dialogs/error-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@tablex/lib/utils"
import { error } from "@tauri-apps/plugin-log"
import { customAlphabet } from "nanoid"
import { toast } from "sonner"
import { z } from "zod"
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
      connString = `${params.driver}://${params.username}:${params.password}@${
        params.host
      }:${params.port}/${params.db}?sslmode=${
        params.sslMode ? "require" : "disable"
      }`
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
export function unwrapResult<T>(result: Result<T>): T {
  if (result.status === "error") {
    throw new Error(result.error.message)
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

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return ""

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts
    }).format(new Date(date))
  } catch (_err) {
    return ""
  }
}

const prefixes: Record<string, unknown> = {}

interface GenerateIdOptions {
  length?: number
  separator?: string
}

export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {}
) {
  const finalOptions =
    typeof prefixOrOptions === "object" ? prefixOrOptions : inputOptions

  const prefix =
    typeof prefixOrOptions === "object" ? undefined : prefixOrOptions

  const { length = 12, separator = "_" } = finalOptions
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length
  )()

  return prefix ? `${prefixes[prefix]}${separator}${id}` : id
}

export function zodJsonValidation() {
  return z.custom<object | string>().superRefine((obj, ctx) => {
    if (typeof obj === "string") {
      try {
        const parsed = JSON.parse(obj)
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          ctx.addIssue({ code: "custom", message: "Invalid JSON" })
        } else return parsed
      } catch (e) {
        ctx.addIssue({ code: "custom", message: "Invalid JSON" })
        return z.NEVER
      }
    } else if (typeof obj === "object") {
      return obj
    }
  })
}

export type KeysOfUnion<T> = T extends object
  ? keyof T
  : T extends string
    ? T
    : never
