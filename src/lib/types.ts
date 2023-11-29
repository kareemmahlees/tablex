export interface ConnectionDetails {
  // naming is lower case because how they are stored in rust
  conn_string: string;
  conn_name: string;
  driver: "sqlite" | "psql" | "mysql";
}

export type Connections = Record<string, ConnectionDetails>;
