import { clsx, type ClassValue } from "clsx"
import { toast, type Renderable, type ValueOrFunction } from "react-hot-toast"
import { twMerge } from "tailwind-merge"
import { Drivers, type ConnectionStringParams } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function customToast<T>(
  promise: Promise<T>,
  onSuccess: ValueOrFunction<Renderable, T>,
  id?: string
) {
  toast.promise(
    promise,
    {
      loading: "Loading..",
      success: onSuccess,
      error: (e) => e
    },
    {
      id
    }
  )
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
