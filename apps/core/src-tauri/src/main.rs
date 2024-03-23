// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod connection;
mod drivers;
mod row;
mod state;
mod table;
mod utils;

use connection::{
    connections_exist, create_connection_record, delete_connection_record, establish_connection,
    get_connection_details, get_connections, test_connection,
};
use row::{create_row, delete_rows, get_paginated_rows, update_row};
use state::SharedState;
use table::{get_columns_definition, get_tables};
#[cfg(not(debug_assertions))]
use tauri::api::process::CommandChild;
use tauri::async_runtime::Mutex;
use tauri::{Manager, Window, WindowEvent};

#[tauri::command]
async fn close_splashscreen(window: Window) {
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
    cli::parse_cli_args();

    tauri::Builder::default()
        .manage(Mutex::new(SharedState::default()))
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            #[cfg(debug_assertions)]
            {
                main_window.open_devtools();
                main_window.close_devtools();
            }

            let exist = connections_exist(app.app_handle()).unwrap();

            if exist {
                let _ = main_window.eval("window.location.replace('/connections')");
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
            get_columns_definition,
            create_row,
            update_row,
        ])
        .on_window_event(move |event| {
            if let WindowEvent::Destroyed = event.event() {
                let state: tauri::State<'_, Mutex<SharedState>> = event.window().state();
                let rt = tokio::runtime::Runtime::new().unwrap();
                let mut stt = rt.block_on(state.lock());
                rt.block_on(stt.cleanup());
                rt.shutdown_background();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
