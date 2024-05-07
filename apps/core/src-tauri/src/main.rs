// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod connection;
mod row;
mod state;
mod table;

use crate::state::SharedState;
use connection::{
    connections_exist, create_connection_record, delete_connection_record, establish_connection,
    get_connection_details, get_connections, test_connection,
};
use row::{create_row, delete_rows, get_fk_relations, get_paginated_rows, update_row};
#[cfg(debug_assertions)]
use specta::ts::{BigIntExportBehavior, ExportConfiguration};
use table::{get_columns_props, get_tables};
use tauri::async_runtime::Mutex;
use tauri::{Manager, Window, WindowEvent};
#[cfg(debug_assertions)]
use tauri_specta::ts;

#[tauri::command]
#[specta::specta]
fn close_splashscreen(window: Window) {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();

        window
            .get_window("main")
            .expect("no window labeled 'main' found")
            .show()
            .unwrap();
    }
}

fn main() {
    #[cfg(debug_assertions)]
    {
        let res = specta::collect_types![
            close_splashscreen,
            test_connection,
            create_connection_record,
            delete_connection_record,
            establish_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            get_tables,
            get_paginated_rows,
            delete_rows,
            get_columns_props,
            create_row,
            update_row,
            get_fk_relations
        ]
        .expect("Failed to collect tauri commands types");
        ts::export_with_cfg(
            res,
            ExportConfiguration::default().bigint(BigIntExportBehavior::Number),
            "../src/bindings.ts",
        )
        .expect("Failed to export specta bindings");
    }

    let (args, cmd) = cli::parse_cli_args();

    tauri::Builder::default()
        .manage(Mutex::new(SharedState::default()))
        .setup(|app| {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(cli::handle_cli_args(&app.app_handle(), args, cmd));

            #[cfg(debug_assertions)]
            {
                let main_window = app.get_window("main").unwrap();
                main_window.open_devtools();
                main_window.close_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            test_connection,
            create_connection_record,
            delete_connection_record,
            establish_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            get_tables,
            get_paginated_rows,
            delete_rows,
            get_columns_props,
            create_row,
            update_row,
            get_fk_relations
        ])
        .on_window_event(move |event| {
            if let WindowEvent::Destroyed = event.event() {
                // If the destroyed window is for e.g splashscreen then don't cleanup
                if event.window().label() != "main" {
                    return;
                }
                let state = event.window().state::<Mutex<SharedState>>();
                let rt = tokio::runtime::Runtime::new().unwrap();
                let mut stt = rt.block_on(state.lock());
                rt.block_on(stt.cleanup());
                rt.shutdown_background();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
