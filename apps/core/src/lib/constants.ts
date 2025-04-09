export const QUERY_KEYS = {
  GET_TABLES: "get_tables",
  GET_TABLE_ROWS: "get_table_rows",
  GET_CONNECTION_DETAILS: "get_connection_details",
  TABLE_COLUMNS: "table_columns"
}

export const LOCAL_STORAGE = {
  LATEST_TABLE: (connectionId: string) => `${connectionId}_latest_table`,
  PAGINATION_STATE: (connectionId: string) => `${connectionId}_pagination_state`
}
