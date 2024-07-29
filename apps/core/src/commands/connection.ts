import { commands } from "@/bindings"
import { customToast } from "@/lib/utils"

export const testConnectionCmd = async (connString: string) => {
  const commandResult = await commands.testConnection(connString)
  customToast(commandResult, () => {}, "test_connection")
}

export const deleteConnectionCmd = async (connId: string) => {
  const commandResult = await commands.deleteConnectionRecord(connId)
  customToast(commandResult, () => {}, "delete_connection")
}
