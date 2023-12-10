import { invoke } from "@tauri-apps/api/tauri"
import toast from "react-hot-toast"

export const testConnection = async (connString: string) => {
  const command = invoke<string>("test_connection", {
    connString
  })
  toast.promise(command, {
    loading: "Loading",
    success: (s) => s,
    error: (e: string) => e
  })
}

export const createConnectionRecord = async (
  connName: string,
  connString: string
) => {
  await invoke("create_connection_record", {
    connString,
    connName
  })
}