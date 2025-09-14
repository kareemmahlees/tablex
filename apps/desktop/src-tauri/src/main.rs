// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod commands;
mod state;

#[cfg(feature = "updater")]
mod updater;

use commands::{connection::*, fs::*, row::*, table::*};
#[cfg(debug_assertions)]
use specta_typescript::{BigIntExportBehavior, Typescript};
use state::SharedState;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State, WindowEvent, async_runtime::Mutex};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};
use tauri_specta::{Builder, collect_commands, collect_events};
use tx_keybindings::*;
use tx_lib::{TxError, events::*};
use tx_settings::*;

fn ensure_config_files_exist(app: &AppHandle) -> Result<(), TxError> {
    ensure_settings_file_exist(&get_settings_file_path(app)?)?;
    ensure_keybindings_file_exist(&get_keybindings_file_path(app)?)?;
    ensure_connections_file_exist(&get_connections_file_path(app)?)?;
    Ok(())
}

fn setup_logging_plugin() -> tauri_plugin_log::Builder {
    let builder = tauri_plugin_log::Builder::new()
        .clear_targets()
        .max_file_size(2_000_000)
        .rotation_strategy(RotationStrategy::KeepAll)
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
        });

    #[cfg(debug_assertions)]
    let builder = builder.target(Target::new(TargetKind::Stdout));

    #[cfg(not(debug_assertions))]
    {
        use log::Level;

        let builder = builder.target(Target::new(TargetKind::LogDir { file_name: None }).filter(
            |metadata| {
                metadata.level() != Level::Debug
                    && metadata.level() != Level::Trace
                    && !metadata.target().starts_with("tao")
            },
        ));
    }

    builder
}

type AppState<'a> = State<'a, Arc<Mutex<SharedState>>>;

fn main() {
    let builder = Builder::<tauri::Wry>::new()
        .typ::<Keybinding>()
        .typ::<Settings>()
        .constant("SETTINGS_FILE_PATH", SETTINGS_FILE_PATH)
        .constant("KEYBINDINGS_FILE_NAME", KEYBINDINGS_FILE_PATH)
        .commands(collect_commands![
            is_metax_build,
            kill_metax,
            start_metax,
            get_metax_status,
            // Connection commands.
            test_connection,
            create_connection_record,
            delete_connection_record,
            establish_connection,
            drop_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            // Fs commands.
            open_in_external_editor,
            load_settings_file,
            write_into_settings_file,
            write_into_keybindings_file,
            // Table commands.
            discover_db_schema,
            execute_raw_query,
            // Row commands.
            get_paginated_rows,
            delete_rows,
            create_row,
            update_row,
            get_fk_relations
        ])
        .events(collect_events![ConnectionsChanged, TableContentsChanged,])
        .error_handling(tauri_specta::ErrorHandlingMode::Throw);

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

    let mut tauri_builder = tauri::Builder::default()
        .manage(Arc::new(Mutex::new(SharedState::default())))
        .plugin(tauri_plugin_opener::init())
        .plugin(setup_logging_plugin().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            let app_handle = app.app_handle();

            tauri::async_runtime::block_on(async move {
                cli::handle_cli_args(app_handle, args, cmd).await;
            });

            ensure_config_files_exist(app_handle)?;

            builder.mount_events(app);

            // #[cfg(debug_assertions)]
            // {
            //     let main_window = app.get_webview_window("main").unwrap();
            //     main_window.open_devtools();
            //     main_window.close_devtools();
            // }

            #[cfg(feature = "updater")]
            {
                app_handle.plugin(tauri_plugin_updater::Builder::new().build())?;

                let settings = load_settings_file(app_handle.clone())?;

                if settings.check_for_updates {
                    updater::check_for_update(app_handle.clone())?;
                }
            }

            Ok(())
        })
        .on_window_event(move |window, event| {
            if let WindowEvent::Destroyed = event {
                let state = window.state::<Mutex<SharedState>>();
                tauri::async_runtime::block_on(async move {
                    state.lock().await.cleanup();
                });
            }
        });

    #[cfg(feature = "metax")]
    {
        tauri_builder = tauri_builder.plugin(tauri_plugin_shell::init());
    }

    tauri_builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
