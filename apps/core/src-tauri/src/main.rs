// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod connection;
mod drivers;
mod row;
mod table;
mod utils;

use connection::{
    connections_exist, create_connection_record, delete_connection_record, establish_connection,
    get_connection_details, get_connections, test_connection,
};
use row::{create_row, delete_rows, get_rows, update_row};
use sqlx::sqlite::SqlitePool;
use sqlx::{MySqlPool, PgPool};
use table::{get_columns_definition, get_tables};
use tokio::sync::Mutex;
use utils::Drivers;

#[derive(Default)]
pub struct DbInstance {
    sqlite_pool: Mutex<Option<SqlitePool>>,
    postgres_pool: Mutex<Option<PgPool>>,
    mysql_pool: Mutex<Option<MySqlPool>>,
    driver: Mutex<Option<Drivers>>,
}

fn main() {
    tauri::Builder::default()
        .manage(DbInstance {
            sqlite_pool: Default::default(),
            postgres_pool: Default::default(),
            mysql_pool: Default::default(),
            driver: Default::default(),
        })
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            test_connection,
            create_connection_record,
            delete_connection_record,
            establish_connection,
            connections_exist,
            get_connections,
            get_connection_details,
            get_tables,
            get_rows,
            delete_rows,
            get_columns_definition,
            create_row,
            update_row,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
