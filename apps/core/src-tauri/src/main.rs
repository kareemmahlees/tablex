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
use tauri::{Manager, WindowEvent};
use tokio::sync::Mutex;
use utils::Drivers;

#[derive(Default)]
pub struct DbInstance {
    sqlite_pool: Mutex<Option<SqlitePool>>,
    postgres_pool: Mutex<Option<PgPool>>,
    mysql_pool: Mutex<Option<MySqlPool>>,
    driver: Mutex<Option<Drivers>>,
}

impl DbInstance {
    async fn cleanup_connections(&self) {
        let long_lived = self.sqlite_pool.lock().await;
        let sqlite_pool = long_lived.as_ref();
        if let Some(sqlite_pool) = sqlite_pool {
            sqlite_pool.close().await
        }

        let long_lived = self.postgres_pool.lock().await;
        let postgres_pool = long_lived.as_ref();
        if let Some(postgres_pool) = postgres_pool {
            postgres_pool.close().await
        }

        let long_lived = self.mysql_pool.lock().await;
        let mysql_pool = long_lived.as_ref();
        if let Some(mysql_pool) = mysql_pool {
            mysql_pool.close().await
        }
    }
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
        .on_window_event(move |event| match event.event() {
            WindowEvent::Destroyed => {
                let db_instance: tauri::State<'_, DbInstance> = event.window().state();
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(db_instance.cleanup_connections());
                rt.shutdown_background();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
