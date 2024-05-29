import { commands } from "@/bindings"
import { customToast } from "@tablex/lib/utils"
import type { Router } from "@tanstack/react-router"

export const testConnectionCmd = async (connString: string) => {
  const commandResult = await commands.testConnection(connString)
  customToast(commandResult, (s) => s, "test_connection")
}

export const deleteConnectionCmd = async (router: Router, connId: string) => {
  const commandResult = await commands.deleteConnectionRecord(connId)
  customToast(
    commandResult,
    () => {
      router.invalidate()
      return "Successfully deleted connection"
    },
    "delete_connection"
  )
}
