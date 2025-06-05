export const QUERY_KEYS = {
  GET_TABLES: "get_tables",
  TABLE_ROWS: "table_rows",
  GET_CONNECTION_DETAILS: "get_connection_details",
  DB_SCHEMA: "db_schema"
}

export const LOCAL_STORAGE = {
  LATEST_TABLE: (connectionId: string) => `${connectionId}_latest_table`,
  PAGINATION_STATE: (connectionId: string) => `${connectionId}_pagination_state`
}
