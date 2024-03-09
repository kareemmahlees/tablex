import { clsx, type ClassValue } from "clsx"
import toast from "react-hot-toast"
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
    case Drivers.MySQL:
      connString = `${params.driver}://${params.username}:${params.password}@${params.host}:${params.port}/${params.db}?sslmode=disable`
      break
  }
  return connString
}

export function customToast<T>(
  promise: Promise<T>,
  callbacks: Omit<Parameters<typeof toast.promise<T>>["1"], "loading">,
  id: string | undefined = undefined
) {
  toast.promise(
    promise,
    {
      loading: "Loading..",
      ...callbacks
    },
    {
      id
    }
  )
}
