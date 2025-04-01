// @ts-nocheck
// This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

/** user-defined commands **/

export const commands = {
  async killMetax(): Promise<null> {
    return await TAURI_INVOKE("kill_metax")
  },
  async testConnection(connString: string): Promise<string> {
    return await TAURI_INVOKE("test_connection", { connString })
  },
  async createConnectionRecord(
    connString: string,
    connName: string,
    driver: Drivers
  ): Promise<string> {
    return await TAURI_INVOKE("create_connection_record", {
      connString,
      connName,
      driver
    })
  },
  async deleteConnectionRecord(connId: string): Promise<string> {
    return await TAURI_INVOKE("delete_connection_record", { connId })
  },
  async establishConnection(
    connString: string,
    driver: Drivers
  ): Promise<null> {
    return await TAURI_INVOKE("establish_connection", { connString, driver })
  },
  async dropConnection(): Promise<null> {
    return await TAURI_INVOKE("drop_connection")
  },
  async connectionsExist(): Promise<boolean> {
    return await TAURI_INVOKE("connections_exist")
  },
  async getConnections(): Promise<{ [key in string]: ConnConfig }> {
    return await TAURI_INVOKE("get_connections")
  },
  async getConnectionDetails(connId: string): Promise<ConnConfig> {
    return await TAURI_INVOKE("get_connection_details", { connId })
  },
  async openInExternalEditor(file: ConfigFile): Promise<null> {
    return await TAURI_INVOKE("open_in_external_editor", { file })
  },
  async loadSettingsFile(): Promise<Settings> {
    return await TAURI_INVOKE("load_settings_file")
  },
  async writeIntoSettingsFile(settings: JsonValue): Promise<null> {
    return await TAURI_INVOKE("write_into_settings_file", { settings })
  },
  async writeIntoKeybindingsFile(keybindings: Keybinding[]): Promise<null> {
    return await TAURI_INVOKE("write_into_keybindings_file", { keybindings })
  },
  async getTables(): Promise<string[]> {
    return await TAURI_INVOKE("get_tables")
  },
  async getColumnsProps(tableName: string): Promise<ColumnInfo[]> {
    return await TAURI_INVOKE("get_columns_props", { tableName })
  },
  async executeRawQuery(
    query: string
  ): Promise<{ [key in string]: JsonValue }> {
    return await TAURI_INVOKE("execute_raw_query", { query })
  },
  async getPaginatedRows(
    tableName: string,
    pageIndex: number,
    pageSize: number
  ): Promise<PaginatedRows> {
    return await TAURI_INVOKE("get_paginated_rows", {
      tableName,
      pageIndex,
      pageSize
    })
  },
  async deleteRows(
    pkColName: string,
    rowPkValues: JsonValue[],
    tableName: string
  ): Promise<string> {
    return await TAURI_INVOKE("delete_rows", {
      pkColName,
      rowPkValues,
      tableName
    })
  },
  async createRow(
    tableName: string,
    data: { [key in string]: JsonValue }
  ): Promise<string> {
    return await TAURI_INVOKE("create_row", { tableName, data })
  },
  async updateRow(
    tableName: string,
    pkColName: string,
    pkColValue: JsonValue,
    data: { [key in string]: JsonValue }
  ): Promise<string> {
    return await TAURI_INVOKE("update_row", {
      tableName,
      pkColName,
      pkColValue,
      data
    })
  },
  async getFkRelations(
    tableName: string,
    columnName: string,
    cellValue: JsonValue
  ): Promise<FKRows[]> {
    return await TAURI_INVOKE("get_fk_relations", {
      tableName,
      columnName,
      cellValue
    })
  }
}

/** user-defined events **/

export const events = __makeEvents__<{
  connectionsChanged: ConnectionsChanged
  tableContentsChanged: TableContentsChanged
}>({
  connectionsChanged: "connections-changed",
  tableContentsChanged: "table-contents-changed"
})

/** user-defined constants **/

export const KEYBINDINGS_FILE_NAME = "keybindings.json" as const
export const SETTINGS_FILE_NAME = "settings.json" as const

/** user-defined types **/

export type ColumnInfo = {
  name: string
  nullable: boolean
  pk: boolean
  type: CustomColumnType
}
export type ConfigFile = "settings" | "keybindings" | "logs"
/**
 * Connection Config Stored inside `connections.json` file.
 */
export type ConnConfig = {
  driver: Drivers
  connString: string
  connName: string
}
export type ConnectionsChanged = null
/**
 * Behavior of the cursor blinking style.
 */
export type CursorBlinkingStyle =
  | "blink"
  | "expand"
  | "smooth"
  | "solid"
  | "phase"
export type CustomColumnType =
  | "string"
  | "text"
  | "uuid"
  | "float"
  | "positiveInteger"
  | "boolean"
  | "integer"
  | "date"
  | "dateTime"
  | "time"
  | "year"
  | "json"
  | "binary"
  | "custom"
/**
 * Supported drivers, stored inside connection config in `connections.json`.
 */
export type Drivers = "sqlite" | "postgresql" | "mysql"
/**
 * Vertical/Horizontal scrollbar visibility.
 */
export type EditorScrollBarVisibility = {
  /**
   * Toggle vertical scrollbar visibility.
   */
  vertical: Visibility
  /**
   * Toggle horizontal scrollbar visibility.
   */
  horizontal: Visibility
}
export type FKRows = {
  tableName: string
  rows: { [key in string]: JsonValue }[]
}
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key in string]: JsonValue }
/**
 * Represents a keybinding record in the keybindings json file.
 *
 * It's only used as a type on the frontend and to generate default keybindings, beside that it doesn't have
 * any backend logic involved.
 */
export type Keybinding = { shortcuts: string[]; command: KeybindingCommand }
export type KeybindingCommand = Sidebar | Table
export type PaginatedRows = {
  data: { [key in string]: JsonValue }[]
  pageCount: number
}
/**
 * Configuration for the SQL editor.
 */
export type SQLEditorSettings = {
  /**
   * Visibility of the right-hand-side minimap.
   */
  minimap: boolean
  /**
   * Vertical/Horizontal scrollbar visibility.
   */
  scrollbar: EditorScrollBarVisibility
  /**
   * Editor font size.
   */
  fontSize: number
  /**
   * Behavior of the cursor blinking style.
   */
  cursorBlinking: CursorBlinkingStyle
}
/**
 * The configuration object for TableX's settings.
 */
export type Settings = {
  /**
   * Remote schema url for autocompletion.
   */
  $schema: string | null
  /**
   * Number of rows to be fetched per page.
   */
  pageSize: number
  /**
   * Wether to automatically check for updates or not.
   */
  checkForUpdates: boolean
  /**
   * Configuration for the SQL editor.
   */
  sqlEditor: SQLEditorSettings
}
export type Sidebar = "focusSearch"
export type Table = "deleteRow" | "copyRow" | "selectAll"
export type TableContentsChanged = null
/**
 * Global error object returned by all commands
 */
export type TxError = {
  /**
   * short message to be displayed in the toast
   */
  message: string
  /**
   * Detailed error message throwing by the low level api
   */
  details: string
}
/**
 * General visibility settings.
 */
export type Visibility = "hidden" | "visible" | "auto"

/** tauri-specta globals **/

import {
  invoke as TAURI_INVOKE,
  Channel as TAURI_CHANNEL
} from "@tauri-apps/api/core"
import * as TAURI_API_EVENT from "@tauri-apps/api/event"
import { type WebviewWindow as __WebviewWindow__ } from "@tauri-apps/api/webviewWindow"

type __EventObj__<T> = {
  listen: (
    cb: TAURI_API_EVENT.EventCallback<T>
  ) => ReturnType<typeof TAURI_API_EVENT.listen<T>>
  once: (
    cb: TAURI_API_EVENT.EventCallback<T>
  ) => ReturnType<typeof TAURI_API_EVENT.once<T>>
  emit: T extends null
    ? (payload?: T) => ReturnType<typeof TAURI_API_EVENT.emit>
    : (payload: T) => ReturnType<typeof TAURI_API_EVENT.emit>
}

export type Result<T, E> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E }

function __makeEvents__<T extends Record<string, any>>(
  mappings: Record<keyof T, string>
) {
  return new Proxy(
    {} as unknown as {
      [K in keyof T]: __EventObj__<T[K]> & {
        (handle: __WebviewWindow__): __EventObj__<T[K]>
      }
    },
    {
      get: (_, event) => {
        const name = mappings[event as keyof T]

        return new Proxy((() => {}) as any, {
          apply: (_, __, [window]: [__WebviewWindow__]) => ({
            listen: (arg: any) => window.listen(name, arg),
            once: (arg: any) => window.once(name, arg),
            emit: (arg: any) => window.emit(name, arg)
          }),
          get: (_, command: keyof __EventObj__<any>) => {
            switch (command) {
              case "listen":
                return (arg: any) => TAURI_API_EVENT.listen(name, arg)
              case "once":
                return (arg: any) => TAURI_API_EVENT.once(name, arg)
              case "emit":
                return (arg: any) => TAURI_API_EVENT.emit(name, arg)
            }
          }
        })
      }
    }
  )
}
