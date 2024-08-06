// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod commands;
mod state;
#[cfg(not(debug_assertions))]
mod updater;

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
#[cfg(not(debug_assertions))]
use updater::check_for_update;

use specta_typescript::{BigIntExportBehavior, Typescript};
use state::SharedState;
use tauri::{async_runtime::Mutex, AppHandle, Manager, Window, WindowEvent};
use tauri_specta::{collect_commands, collect_events, Builder};
use tx_keybindings::{
    ensure_keybindings_file_exist, get_keybindings_file_path, Keybinding, KEYBINDINGS_FILE_NAME,
};
use tx_lib::events::{ConnectionsChanged, TableContentsChanged};
use tx_settings::{
    ensure_settings_file_exist, get_settings_file_path, Settings, SETTINGS_FILE_NAME,
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

fn ensure_config_files_exist(app: &AppHandle) -> Result<(), String> {
    ensure_settings_file_exist(&get_settings_file_path(app)?)?;
    ensure_keybindings_file_exist(&get_keybindings_file_path(app)?)?;
    ensure_connections_file_exist(&get_connections_file_path(app)?)?;
    Ok(())
}

fn main() {
    let builder = Builder::<tauri::Wry>::new()
        .ty::<Keybinding>()
        .ty::<Settings>()
        .constant("KEYBINDINGS_FILE_NAME", KEYBINDINGS_FILE_NAME)
        .constant("SETTINGS_FILE_NAME", SETTINGS_FILE_NAME)
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
        .events(collect_events![ConnectionsChanged, TableContentsChanged,]);

    #[cfg(debug_assertions)]
    builder
        .export(
            Typescript::new()
                .header("// @ts-nocheck")
                .bigint(BigIntExportBehavior::Number),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    let (args, cmd) = cli::parse_cli_args();

    let tauri_builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(SharedState::default()))
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            let app_handle = app.app_handle();

            ensure_config_files_exist(app_handle)?;
            builder.mount_events(app);

            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(cli::handle_cli_args(app_handle, args, cmd));

            #[cfg(debug_assertions)]
            {
                let main_window = app.get_webview_window("main").unwrap();
                main_window.open_devtools();
                main_window.close_devtools();
            }

            #[cfg(not(debug_assertions))]
            {
                app_handle.plugin(tauri_plugin_updater::Builder::new().build())?;
                check_for_update(app_handle.clone())?;
            }

            Ok(())
        })
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
