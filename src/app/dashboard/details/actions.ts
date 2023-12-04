import { invoke } from "@tauri-apps/api/tauri";

export const getRows = async (tableName: string) => {
  return await invoke<Record<string, any>[]>("get_rows", { tableName });
};

export const getColumns = async (tableName: string) => {
  return await invoke<string[]>("get_columns", { tableName });
};

export const deleteRows = async (
  col: string,
  values: any[],
  tableName: string
) => {
  return await invoke<number>("delete_row", { col, values, tableName });
};
