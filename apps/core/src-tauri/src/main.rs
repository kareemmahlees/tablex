// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cli;
mod connection;
mod drivers;
mod row;
mod table;
mod utils;

use connection::{
    connections_exist, create_connection_record, delete_connection_record, establish_connection,
    get_connection_details, get_connections, test_connection,
};
use row::{create_row, delete_rows, get_paginated_rows, update_row};
use sqlx::sqlite::SqlitePool;
use sqlx::{MySqlPool, PgPool};
use table::{get_columns_definition, get_tables};
#[cfg(not(debug_assertions))]
use tauri::api::process::CommandChild;
use tauri::{Manager, Window, WindowEvent};
use tokio::sync::Mutex;
use utils::Drivers;

#[tauri::command]
async fn close_splashscreen(window: Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();

        window
            .get_window("main")
            .expect("no window labeled 'main' found")
            .show()
            .unwrap();
    }
}

#[derive(Default)]
pub struct DbInstance {
    sqlite_pool: Mutex<Option<SqlitePool>>,
    postgres_pool: Mutex<Option<PgPool>>,
    mysql_pool: Mutex<Option<MySqlPool>>,
    driver: Mutex<Option<Drivers>>,
    #[cfg(not(debug_assertions))]
    metax_command_child: Mutex<Option<CommandChild>>,
}

impl DbInstance {
    async fn cleanup(&self) {
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

        #[cfg(not(debug_assertions))]
        {
            let mut long_lived = self.metax_command_child.lock().await;
            if let Some(command) = long_lived.take() {
                command.kill().expect("unable to kill sidecar")
            }
        }
    }
}

fn main() {
    cli::parse_cli_args();

    tauri::Builder::default()
        .manage(DbInstance {
            sqlite_pool: Default::default(),
            postgres_pool: Default::default(),
            mysql_pool: Default::default(),
            driver: Default::default(),
            #[cfg(not(debug_assertions))]
            metax_command_child: Default::default(),
        })
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            #[cfg(debug_assertions)]
            {
                main_window.open_devtools();
                main_window.close_devtools();
            }

            // let exist = connections_exist(app.app_handle()).unwrap();

            // if exist {
            //     let _ = main_window.eval(&format!(
            //         "window.location.replace('http://localhost:{}/connect')",
            //         "5173"
            //     ));
            // }

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
                let state: tauri::State<'_, DbInstance> = event.window().state();
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(state.cleanup());
                rt.shutdown_background();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
