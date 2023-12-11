import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SupportedDrivers } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ConnectionStringParams =
  | {
      driver: SupportedDrivers.SQLITE
      filePath: string
    }
  | {
      driver: SupportedDrivers.PSQL | SupportedDrivers.MYSQL
      username: string
      password: string
      host: string
      port: number
      db: string
    }

/**
 * creates connection string for the specified driver accordingly
 * @returns connection string
 */
export function constructConnectionString(params: ConnectionStringParams) {
  let connString = ""
  switch (params.driver) {
    case SupportedDrivers.SQLITE:
      connString = `${params.driver}:${params.filePath}`
      break
    case SupportedDrivers.PSQL:
      connString = `${params.driver}://${params.username}:${params.password}@${params.host}:${params.port}/${params.db}`
      break
    case SupportedDrivers.MYSQL:
      connString = `Server=${params.host};Port=${params.port};Database=${params.db};Uid=${params.username};Pwd=${params.password};`
      break
  }
  return connString
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
      // @ts-ignore
      dirtyValues(dirtyFields[key], allValues[key])
    ])
  )
}
