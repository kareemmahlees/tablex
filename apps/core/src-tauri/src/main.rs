// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod commands;
mod state;
#[cfg(not(debug_assertions))]
mod updater;

use commands::{connection::*, fs::*, row::*, table::*};
#[cfg(not(debug_assertions))]
use updater::check_for_update;

use log::Level;
use specta_typescript::{BigIntExportBehavior, Typescript};
use state::SharedState;
use tauri::{async_runtime::Mutex, AppHandle, Manager, Window, WindowEvent};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};
use tauri_specta::{collect_commands, collect_events, Builder};
use tx_keybindings::*;
use tx_lib::{events::*, TxError};
use tx_settings::*;

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

fn ensure_config_files_exist(app: &AppHandle) -> Result<(), TxError> {
    ensure_settings_file_exist(&get_settings_file_path(app)?)?;
    ensure_keybindings_file_exist(&get_keybindings_file_path(app)?)?;
    ensure_connections_file_exist(&get_connections_file_path(app)?)?;
    Ok(())
}

fn main() {
    let builder = Builder::<tauri::Wry>::new()
        .typ::<Keybinding>()
        .typ::<Settings>()
        .constant("KEYBINDINGS_FILE_NAME", KEYBINDINGS_FILE_NAME)
        .constant("SETTINGS_FILE_NAME", SETTINGS_FILE_NAME)
        .commands(collect_commands![
            close_splashscreen,
            // Connection commands.
            test_connection,
            create_connection_record,
            delete_connection_record,
            establish_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            // Fs commands.
            open_in_external_editor,
            load_settings_file,
            write_into_settings_file,
            write_into_keybindings_file,
            // Table commands.
            get_tables,
            get_columns_props,
            execute_raw_query,
            // Row commands.
            get_paginated_rows,
            delete_rows,
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
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .targets([
                    Target::new(TargetKind::LogDir { file_name: None }).filter(|metadata| {
                        metadata.level() != Level::Debug && metadata.level() != Level::Trace
                    }),
                    Target::new(TargetKind::Stdout),
                ])
                .format(|out, message, record| {
                    out.finish(format_args!(
                        "{} [{}] {}",
                        TimezoneStrategy::UseUtc
                            .get_now()
                            .format(
                                &time::format_description::parse(
                                    "[year]-[month]-[day] [hour]:[minute]:[second]"
                                )
                                .unwrap()
                            )
                            .unwrap(),
                        record.level(),
                        message
                    ))
                })
                .rotation_strategy(RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(SharedState::default()))
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            let app_handle = app.app_handle();
            let rt = tokio::runtime::Runtime::new().unwrap();

            ensure_config_files_exist(app_handle)?;
            let _settings = load_settings_file(app_handle.clone())?;

            builder.mount_events(app);

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
                if _settings.check_for_updates {
                    check_for_update(app_handle.clone())?;
                }
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
