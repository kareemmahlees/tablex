import { type DriversValues } from "@/lib/types"
import { customToast } from "@/lib/utils"
import { invoke } from "@tauri-apps/api/tauri"

export const testConnection = async (
  connString: string,
  driver: DriversValues
) => {
  const command = invoke<string>("test_connection", {
    connString,
    driver
  })
  customToast(
    command,
    {
      success: (s) => s,
      error: (e: string) => e
    },
    "test_connection"
  )
}

export const createConnectionRecord = async (
  connName: string,
  connString: string,
  driver: DriversValues
) => {
  await invoke("create_connection_record", {
    connString,
    connName,
    driver
  })
}
