export interface ConnectionDetails {
  connString: string
  connName: string
  driver: DriversValues
}

export type Connections = Record<string, ConnectionDetails>

export const Drivers = {
  SQLite: "sqlite",
  PostgreSQL: "postgresql",
  MySQL: "mysql"
} as const

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

export type DriversValues = (typeof Drivers)[keyof typeof Drivers]

export interface ColumnProps {
  type: string
  notNull: boolean
  defaultValue: any
  pk: boolean
}
