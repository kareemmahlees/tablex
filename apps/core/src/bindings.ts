// @ts-nocheck
         // This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

         export const commands = {
async closeSplashscreen() : Promise<void> {
await TAURI_INVOKE("close_splashscreen");
},
async testConnection(connString: string) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("test_connection", { connString }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async createConnectionRecord(connString: string, connName: string, driver: Drivers) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("create_connection_record", { connString, connName, driver }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async deleteConnectionRecord(connId: string) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("delete_connection_record", { connId }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async establishConnection(connString: string, driver: Drivers) : Promise<Result<null, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("establish_connection", { connString, driver }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async connectionsExist() : Promise<Result<boolean, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("connections_exist") };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getConnections() : Promise<Result<{ [key in string]: ConnConfig }, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_connections") };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getConnectionDetails(connId: string) : Promise<Result<ConnConfig, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_connection_details", { connId }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getTables() : Promise<Result<string[], string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_tables") };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async executeRawQuery(query: string) : Promise<Result<{ [key in string]: JsonValue }[], string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("execute_raw_query", { query }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getPaginatedRows(tableName: string, pageIndex: number, pageSize: number) : Promise<Result<PaginatedRows, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_paginated_rows", { tableName, pageIndex, pageSize }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async deleteRows(pkColName: string, rowPkValues: JsonValue[], tableName: string) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("delete_rows", { pkColName, rowPkValues, tableName }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getColumnsProps(tableName: string) : Promise<Result<ColumnProps[], string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_columns_props", { tableName }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async createRow(tableName: string, data: { [key in string]: JsonValue }) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("create_row", { tableName, data }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async updateRow(tableName: string, pkColName: string, pkColValue: JsonValue, data: { [key in string]: JsonValue }) : Promise<Result<string, string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("update_row", { tableName, pkColName, pkColValue, data }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getFkRelations(tableName: string, columnName: string, cellValue: JsonValue) : Promise<Result<FKRows[], string>> {
try {
    return { status: "ok", data: await TAURI_INVOKE("get_fk_relations", { tableName, columnName, cellValue }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
}
}

export const events = __makeEvents__<{
connectionsChanged: ConnectionsChanged,
tableContentsChanged: TableContentsChanged,
commandPaletteOpen: CommandPaletteOpen,
metaXDialogOpen: MetaXDialogOpen,
sqlDialogOpen: SQLDialogOpen
}>({
connectionsChanged: "connections-changed",
tableContentsChanged: "table-contents-changed",
commandPaletteOpen: "command-palette-open",
metaXDialogOpen: "meta-x-dialog-open",
sqlDialogOpen: "sql-dialog-open"
})

/** user-defined types **/

export type ColumnProps = { columnName: string; type: string; isNullable: boolean; defaultValue: JsonValue; isPK: boolean; hasFkRelations: boolean }
export type CommandPaletteOpen = null
/**
 * Connection Config Stored inside `connections.json` file
 */
export type ConnConfig = { driver: Drivers; connString: string; connName: string }
export type ConnectionsChanged = null
/**
 * Supported drivers, stored inside connection config in `connections.json`.
 */
export type Drivers = "sqlite" | "postgresql" | "mysql"
export type FKRows = { tableName: string; rows: { [key in string]: JsonValue }[] }
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key in string]: JsonValue }
export type MetaXDialogOpen = null
export type PaginatedRows = { data: { [key in string]: JsonValue }[]; pageCount: number }
export type SQLDialogOpen = null
export type TableContentsChanged = null

/** tauri-specta globals **/

         import { invoke as TAURI_INVOKE } from "@tauri-apps/api/core";
import * as TAURI_API_EVENT from "@tauri-apps/api/event";
import { type WebviewWindow as __WebviewWindow__ } from "@tauri-apps/api/webviewWindow";

type __EventObj__<T> = {
  listen: (
    cb: TAURI_API_EVENT.EventCallback<T>
  ) => ReturnType<typeof TAURI_API_EVENT.listen<T>>;
  once: (
    cb: TAURI_API_EVENT.EventCallback<T>
  ) => ReturnType<typeof TAURI_API_EVENT.once<T>>;
  emit: T extends null
    ? (payload?: T) => ReturnType<typeof TAURI_API_EVENT.emit>
    : (payload: T) => ReturnType<typeof TAURI_API_EVENT.emit>;
};

export type Result<T, E> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E };

function __makeEvents__<T extends Record<string, any>>(
  mappings: Record<keyof T, string>
) {
  return new Proxy(
    {} as unknown as {
      [K in keyof T]: __EventObj__<T[K]> & {
        (handle: __WebviewWindow__): __EventObj__<T[K]>;
      };
    },
    {
      get: (_, event) => {
        const name = mappings[event as keyof T];

        return new Proxy((() => {}) as any, {
          apply: (_, __, [window]: [__WebviewWindow__]) => ({
            listen: (arg: any) => window.listen(name, arg),
            once: (arg: any) => window.once(name, arg),
            emit: (arg: any) => window.emit(name, arg),
          }),
          get: (_, command: keyof __EventObj__<any>) => {
            switch (command) {
              case "listen":
                return (arg: any) => TAURI_API_EVENT.listen(name, arg);
              case "once":
                return (arg: any) => TAURI_API_EVENT.once(name, arg);
              case "emit":
                return (arg: any) => TAURI_API_EVENT.emit(name, arg);
            }
          },
        });
      },
    }
  );
}

     