// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;
mod sqlite;
use sqlite::{connect_sqlite_db, test_sqlite_conn};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test_sqlite_conn,
            connect_sqlite_db
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
