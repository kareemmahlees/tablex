import { ConnectionDetails } from "@/lib/types";
import { invoke } from "@tauri-apps/api/tauri";

export const getConnectionDetails = async (connId: string) => {
  return await invoke<ConnectionDetails>("get_connection_details", {
    connId,
  });
};

export const establishConnection = async (connString: string) => {
  return await invoke<void>("connect_sqlite", {
    connString,
  });
};

export const getTables = async () => {
  return await invoke<string[]>("get_tables");
};
