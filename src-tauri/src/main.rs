// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod connection;
mod row;
mod table;
mod utils;

use connection::{
    connections_exist, create_connection_record, establish_connection, get_connection_details,
    get_connections, test_connection,
};
use row::{create_row, delete_row, get_rows, update_row};
use sqlx::Pool;
use table::{get_columns_definition, get_tables};
use tokio::sync::Mutex;
use utils::Drivers;

#[derive(Default)]
pub struct DbInstance {
    pool: Mutex<Option<Pool<sqlx::any::Any>>>,
    driver: Mutex<Option<Drivers>>,
}

fn main() {
    tauri::Builder::default()
        .manage(DbInstance {
            pool: Default::default(),
            driver: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            test_connection,
            create_connection_record,
            establish_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            get_tables,
            get_rows,
            delete_row,
            get_columns_definition,
            create_row,
            update_row,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
