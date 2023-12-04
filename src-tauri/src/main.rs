// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod common;
mod sqlite;
mod utils;

use common::{connections_exist, get_connection_details, get_connections};
use sqlite::{
    connect_sqlite, create_sqlite_connection, delete_row, get_columns, get_rows, get_tables,
    test_sqlite_conn,
};
use sqlx::AnyConnection;
use tokio::sync::Mutex;

pub struct DbConnection {
    pub db: Mutex<Option<AnyConnection>>,
}

fn main() {
    tauri::Builder::default()
        .manage(DbConnection {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            test_sqlite_conn,
            create_sqlite_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            connect_sqlite,
            get_tables,
            get_rows,
            get_columns,
            delete_row
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
