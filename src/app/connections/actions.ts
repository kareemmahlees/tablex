import { invoke } from "@tauri-apps/api/tauri";
export interface ConnectionConfig {
  // naming is lower case because how they are stored in rust
  conns_string: string;
  conn_name: string;
  driver: "sqlite" | "psql" | "mysql";
}

export const getConnections = async () => {
  return await invoke<Record<string, ConnectionConfig>>("get_connections");
};
