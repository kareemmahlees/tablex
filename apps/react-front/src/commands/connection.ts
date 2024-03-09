import { type SupportedDrivers } from "@/lib/types"
import { customToast } from "@/lib/utils"
import { invoke } from "@tauri-apps/api/tauri"

export const testConnection = async (
  connString: string,
  driver: SupportedDrivers
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
  driver: SupportedDrivers
) => {
  return await invoke("create_connection_record", {
    connString,
    connName,
    driver
  })
}

export const establishConnection = async (
  connString: string,
  driver: SupportedDrivers
) => {
  return invoke<void>("establish_connection", {
    connString,
    driver
  })
}
