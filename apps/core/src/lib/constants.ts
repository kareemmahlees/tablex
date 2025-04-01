export const QUERY_KEYS = {
  GET_TABLES: "get_tables",
  GET_CONNECTION_DETAILS: "get_connection_details"
}

export const LOCAL_STORAGE = {
  LATEST_TABLE: (connectionId: string) => `${connectionId}_latest_table`
}
