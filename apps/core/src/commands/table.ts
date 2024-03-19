import { invoke } from "@tauri-apps/api/tauri"

export const getTables = async () => {
  return await invoke<string[]>("get_tables")
}
