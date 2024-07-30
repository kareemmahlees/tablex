export type ConnectionDetails = {
  connString: string
  connName: string
  driver: SupportedDrivers
}

export type Connections = Record<string, ConnectionDetails>

export const Drivers = {
  SQLite: "sqlite",
  PostgreSQL: "postgresql",
  MySQL: "mysql"
} as const

export type SupportedDrivers = (typeof Drivers)[keyof typeof Drivers]

/**
 * This is only used in the combo box at the connect page
 * to get a mapable object
 */
export const MappedDrivers = Object.entries(Drivers).map(([key, value]) => {
  return {
    label: key,
    value
  }
})

export type ConnectionStringParams =
  | {
      driver: typeof Drivers.SQLite
      filePath: string
    }
  | {
      driver: typeof Drivers.PostgreSQL | typeof Drivers.MySQL
      username: string
      password: string
      host: string
      port: number
      db: string
    }
