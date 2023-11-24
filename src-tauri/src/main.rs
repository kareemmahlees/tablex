// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod common;
mod sqlite;
mod utils;
use common::{connections_exist, get_connections};
use sqlite::{create_sqlite_connection, test_sqlite_conn};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test_sqlite_conn,
            create_sqlite_connection,
            connections_exist,
            get_connections
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
