// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod common;
mod sqlite;
mod utils;

use common::{connections_exist, get_connection_details, get_connections};
use sqlite::{
    connect_sqlite, create_row, create_sqlite_connection, delete_row, get_columns,
    get_columns_definition, get_rows, get_tables, test_sqlite_conn,
};
use sqlx::Pool;
use tokio::sync::Mutex;

#[derive(Default, Debug)]
pub struct DbInstance {
    pool: Mutex<Option<Pool<sqlx::any::Any>>>,
}

fn main() {
    tauri::Builder::default()
        .manage(DbInstance {
            pool: Default::default(),
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
            delete_row,
            get_columns_definition,
            create_row,
            update_row,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
