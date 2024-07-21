// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod commands;
mod state;

use commands::{
    connection::{
    connections_exist, create_connection_record, delete_connection_record,
    ensure_connections_file_exist, establish_connection, get_connection_details,
        get_connections, get_connections_file_path, test_connection,
},
    fs::open_in_external_editor,
    row::{create_row, delete_rows, get_fk_relations, get_paginated_rows, update_row},
    table::{execute_raw_query, get_columns_props, get_tables},
};

use specta::{
    ts::{BigIntExportBehavior, ExportConfig},
    TypeCollection,
};
use state::SharedState;
use tauri::{async_runtime::Mutex, AppHandle, Manager, Window, WindowEvent};
use tauri_specta::{collect_commands, collect_events};
use tx_keybindings::{ensure_keybindings_file_exist, get_keybindings_file_path, Keybinding};
use tx_lib::events::{
    CommandPaletteOpen, ConnectionsChanged, MetaXDialogOpen, SQLDialogOpen, TableContentsChanged,
};
use tx_settings::{ensure_settings_file_exist, get_settings_file_path, Settings};

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

fn ensure_config_files_exist(app: &AppHandle) -> Result<(), String> {
    ensure_settings_file_exist(&get_settings_file_path(app)?)?;
    ensure_keybindings_file_exist(&get_keybindings_file_path(app)?)?;
    ensure_connections_file_exist(&get_connections_file_path(app)?)?;
    Ok(())
}

fn main() {
    let mut custom_types = TypeCollection::default();
    custom_types.register::<Keybinding>();
    custom_types.register::<Settings>();

    let (invoke_handler, register_events) = {
        let builder = tauri_specta::ts::builder()
            .types(custom_types)
            .commands(collect_commands![
                close_splashscreen,
                test_connection,
                create_connection_record,
                delete_connection_record,
                establish_connection,
                connections_exist,
                open_in_external_editor,
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
            ])
            .header("// @ts-nocheck\n");

        #[cfg(debug_assertions)]
        let builder = builder.path("../src/bindings.ts");
        let builder = builder.config(ExportConfig::default().bigint(BigIntExportBehavior::Number));

        builder.build().unwrap()
    };

    let (args, cmd) = cli::parse_cli_args();

    let tauri_builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(SharedState::default()))
        .setup(|app| {
            ensure_config_files_exist(app.app_handle())?;
            register_events(app);

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

    tauri_builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
