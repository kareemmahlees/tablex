import type { Connections } from "@/lib/types"
import { invoke } from "@tauri-apps/api/tauri"

export const getConnections = async () => {
  return await invoke<Connections>("get_connections")
}
