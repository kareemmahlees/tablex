import type { Connections } from "@/lib/types"
import { customToast } from "@/lib/utils"
import type { QueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

export const getConnections = async () => {
  return await invoke<Connections>("get_connections")
}

export const deleteConnection = async (
  queryClient: QueryClient,
  connId: string
) => {
  const command = invoke("delete_connection_record", { connId })
  customToast(
    command,
    {
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["connections"] })
        return "Succesfully deleted connection"
      },
      error: (e: string) => e
    },
    "delete_connection"
  )
}
