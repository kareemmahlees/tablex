use crate::{
    drivers::{mysql, postgres, sqlite},
    state::SharedState,
    utils::Drivers,
};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>, String> {
    let state = state.lock().await;
    let driver = state.driver.as_ref().unwrap();
    match driver {
        Drivers::SQLite => {
            let pool = state.sqlite_pool.as_ref().unwrap();
            sqlite::table::get_tables(pool).await
        }
        Drivers::PostgreSQL => {
            let pool = state.postgres_pool.as_ref().unwrap();
            postgres::table::get_tables(pool).await
        }
        Drivers::MySQL => {
            let pool = state.mysql_pool.as_ref().unwrap();
            mysql::table::get_tables(pool).await
        }
    }
}

#[tauri::command]
pub async fn get_columns_definition(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let state = state.lock().await;
    let driver = state.driver.as_ref().unwrap();
    match driver {
        Drivers::SQLite => {
            let pool = state.sqlite_pool.as_ref().unwrap();
            sqlite::table::get_columns_definition(pool, table_name).await
        }
        Drivers::PostgreSQL => {
            let pool = state.postgres_pool.as_ref().unwrap();
            postgres::table::get_columns_definition(pool, table_name).await
        }
        Drivers::MySQL => {
            let pool = state.mysql_pool.as_ref().unwrap();
            mysql::table::get_columns_definition(pool, table_name).await
        }
    }
}
