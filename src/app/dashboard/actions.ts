import {
  date_data_types,
  numeric_data_types,
  string_data_types
} from "@/lib/constants"
import type { ColumnProps, ConnectionDetails, DriversValues } from "@/lib/types"
import { customToast } from "@/lib/utils"
import type { QueryClient } from "@tanstack/react-query"
import { register } from "@tauri-apps/api/globalShortcut"
import { invoke } from "@tauri-apps/api/tauri"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import type { Dispatch, RefObject, SetStateAction } from "react"
import toast from "react-hot-toast"
import { z } from "zod"

export const getConnectionDetails = async (connId: string) => {
  return await invoke<ConnectionDetails>("get_connection_details", {
    connId
  })
}

/**
 * This function returns a boolean representing there is an error of connection.
 * Because this is a crucial part of the process we have to abort on error
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

export const getColsDefinitions = async (tableName: string) => {
  return await invoke<Record<string, ColumnProps>>("get_columns_definition", {
    tableName
  })
}

export const getZodSchemaFromCols = async (tableName: string) => {
  const cols = await getColsDefinitions(tableName)
  let schemaObject: z.ZodRawShape = {}
  Object.entries(cols).forEach(([colName, colProps]) => {
    let validationRule: z.ZodTypeAny

    switch (true) {
      case numeric_data_types.includes(colProps.type) ||
        new RegExp("float\\(\\d+.\\d+\\)").test(colProps.type):
        validationRule = z.coerce.number({
          invalid_type_error: "Field must be number"
        })
        break
      case string_data_types.includes(colProps.type) ||
        new RegExp("VARCHAR\\(\\d+\\)").test(colProps.type):
        // this is done to overcome the fact that input values are always string
        validationRule = z.string().refine(
          (val) => {
            // this is done because IPs fall into the isNaN check
            if (z.string().ip().safeParse(val).success) {
              return true
            }
            return isNaN(parseInt(val))
          },
          {
            message: "Field must be a valid string"
          }
        )
        break
      // only valid in postgres
      case colProps.type == "uuid":
        validationRule = z.string().uuid()
      case colProps.type == "boolean":
        validationRule = z.boolean()
      case date_data_types.includes(colProps.type):
        validationRule = z.date()
      default:
        validationRule = z.any()
    }

    if (colProps.isNullable) {
      validationRule = validationRule.optional()
    }

    schemaObject[colName] = validationRule
  })

  return z.object(schemaObject)
}

export const createRow = async (
  tableName: string,
  data: Record<string, any>,
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>,
  queryClient: QueryClient
) => {
  const command = invoke<number>("create_row", { tableName, data })

  customToast(command, {
    success: (s) => {
      setIsSheetOpen(false)
      queryClient.invalidateQueries({ queryKey: ["table_rows"] })
      return `Successfully created ${s} row`
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
