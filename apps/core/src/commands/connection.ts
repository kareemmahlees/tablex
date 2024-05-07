import { deleteConnectionRecord, testConnection } from "@/bindings"
import { customToast } from "@tablex/lib/utils"
import { type Router } from "@tanstack/react-router"

export const testConnectionCmd = async (connString: string) => {
  const command = testConnection(connString)
  customToast(command, (s) => s, "test_connection")
}

export const deleteConnectionCmd = async (router: Router, connId: string) => {
  const command = deleteConnectionRecord(connId)
  customToast(
    command,
    () => {
      router.invalidate()
      return "Succesfully deleted connection"
    },
    "delete_connection"
  )
}
