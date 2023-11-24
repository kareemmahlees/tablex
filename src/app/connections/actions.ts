import { invoke } from "@tauri-apps/api";

interface ConnectionConfig {
  conn_string: string;
  driver: "sqlite" | "psql" | "mysql";
}

export const getConnections = async () => {
  return await invoke<ConnectionConfig[]>("get_connections");
};
