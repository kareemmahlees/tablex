// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod connection;
mod row;
mod shortcut;
mod state;
mod table;

use crate::{shortcut::ShortcutHandler, state::SharedState};
use connection::{
    connections_exist, create_connection_record, delete_connection_record, establish_connection,
    get_connection_details, get_connections, test_connection,
};
use row::{create_row, delete_rows, get_fk_relations, get_paginated_rows, update_row};
use specta::ts::{BigIntExportBehavior, ExportConfig};
use table::{execute_raw_query, get_columns_props, get_tables};
use tauri::async_runtime::Mutex;
use tauri::{Manager, Window, WindowEvent};
use tauri_plugin_global_shortcut::ShortcutState;
use tauri_specta::{collect_commands, collect_events};
use tx_lib::events::{
    CommandPaletteOpen, ConnectionsChanged, MetaXDialogOpen, SQLDialogOpen, Shortcut,
    TableContentsChanged,
};

#[tauri::command]
#[specta::specta]
fn close_splashscreen(window: Window) {
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        splashscreen.close().unwrap();

        window
            .get_webview_window("main")
            .expect("no window labeled 'main' found")
            .show()
            .unwrap();
    }
}
fn main() {
    let (invoke_handler, register_events) = {
        let builder = tauri_specta::ts::builder()
            .commands(collect_commands![
                close_splashscreen,
                test_connection,
                create_connection_record,
                delete_connection_record,
                establish_connection,
                connections_exist,
                get_connections,
                get_connection_details,
                get_tables,
                execute_raw_query,
                get_paginated_rows,
                delete_rows,
                get_columns_props,
                create_row,
                update_row,
                get_fk_relations
            ])
            .events(collect_events![
                ConnectionsChanged,
                TableContentsChanged,
                CommandPaletteOpen,
                MetaXDialogOpen,
                SQLDialogOpen,
                Shortcut
            ])
            .header("// @ts-nocheck\n");

        #[cfg(debug_assertions)]
        let builder = builder.path("../src/bindings.ts");
        let builder = builder.config(ExportConfig::default().bigint(BigIntExportBehavior::Number));

        builder.build().unwrap()
    };

    let (args, cmd) = cli::parse_cli_args();

    let tauri_builder = tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(SharedState::default()))
        .setup(|app| {
            register_events(app);

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_shortcuts(["ctrl+c"])?
                    .with_handler(|app, shortcut, event| {
                        let shortcut_handler = ShortcutHandler::new(app);
                        if event.state == ShortcutState::Pressed {
                            shortcut_handler.handle_shortcut(shortcut);
                        }
                    })
                    .build(),
            )?;

            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(cli::handle_cli_args(app.app_handle(), args, cmd));

            #[cfg(debug_assertions)]
            {
                let main_window = app.get_webview_window("main").unwrap();
                main_window.open_devtools();
                main_window.close_devtools();
            }

            Ok(())
        })
        .invoke_handler(invoke_handler)
        .on_window_event(move |window, event| {
            if let WindowEvent::Destroyed = event {
                // If the destroyed window is for e.g splashscreen then don't cleanup
                if window.label() != "main" {
                    return;
                }
                let state = window.state::<Mutex<SharedState>>();
                let rt = tokio::runtime::Runtime::new().unwrap();
                let mut stt = rt.block_on(state.lock());
                rt.block_on(stt.cleanup());
                rt.shutdown_background();
            }
        });

    #[cfg(feature = "metax")]
    let tauri_builder = tauri_builder.plugin(tauri_plugin_shell::init());

    tauri_builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
