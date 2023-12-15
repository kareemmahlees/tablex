import { ConnectionDetails, type DriversValues } from "@/lib/types"
import { register } from "@tauri-apps/api/globalShortcut"
import { invoke } from "@tauri-apps/api/tauri"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Dispatch, RefObject, SetStateAction } from "react"
import toast from "react-hot-toast"
import { z } from "zod"

export const getConnectionDetails = async (connId: string) => {
  return await invoke<ConnectionDetails>("get_connection_details", {
    connId
  })
}

/**
 * This function returns a boolean representing there is an error of connection
 * because this is a crucial part of the process we have to abort on error
 */
export const establishConnection = async (
  connString: string,
  driver: DriversValues,
  router: AppRouterInstance
): Promise<boolean> => {
  try {
    await invoke<void>("establish_connection", {
      connString,
      driver
    })
    return false
  } catch (error) {
    toast.error(error as string, { id: "connection_error" })
    router.back()
    return true
  }
}

export const getTables = async () => {
  return await invoke<string[]>("get_tables")
}

export const getColsDefinition = async (tableName: string) => {
  return await invoke<Record<string, string>>("get_columns_definition", {
    tableName
  })
}

export const getZodSchemaFromCols = async (tableName: string) => {
  const cols = await getColsDefinition(tableName)
  let schemaObject: z.ZodRawShape = {}
  Object.entries(cols).forEach(([key, value]) => {
    let validationRule: z.ZodTypeAny
    switch (value) {
      case "INT":
        validationRule = z.coerce
          .number({ invalid_type_error: "Field must be number" })
          .min(1, { message: "Field is required" })
        break
      case "VARCHAR(20)":
      case "VARCHAR(50)":
      case "VARCHAR(255)":
        validationRule = z.string().min(1, { message: "Field is required" })
        break
      default:
        validationRule = z.any()
    }

    schemaObject[key] = validationRule
  })

  return z.object(schemaObject)
}

export const createRow = async (
  tableName: string,
  data: Record<string, any>,
  setOpenSheet: Dispatch<SetStateAction<boolean>>
) => {
  const command = invoke<number>("create_row", { tableName, data })
  toast.promise(command, {
    loading: "Creating...",
    success: (s) => {
      setOpenSheet(false)
      return `Successfully created ${s} rows`
    },
    error: (e: string) => e
  })
}

export const registerSearchShortcut = (
  inputRef: RefObject<HTMLInputElement>
) => {
  register("CommandOrControl+S", () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  })
}
