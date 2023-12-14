export interface ConnectionDetails {
  // naming is lower case because how they are stored in rust
  conn_string: string
  conn_name: string
  driver: SupportedDrivers
}

export type Connections = Record<string, ConnectionDetails>

export enum SupportedDrivers {
  SQLITE = "sqlite",
  PSQL = "psql",
  MYSQL = "mysql"
}
