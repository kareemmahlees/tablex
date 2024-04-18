use mysql;
use postgres;
use serde_json::Value as JsonValue;
use sqlite;
use sqlx::Row;
use std::collections::HashMap;
use tauri::async_runtime::Mutex;
use tauri::State;
use tx_lib::{state::SharedState, Drivers};

#[tauri::command]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>, String> {
    let state = state.lock().await;
    dbg!(&state);
    let handler = state.handler.as_ref().unwrap();
    let tables = handler.get_tables().await?;

    if tables.is_empty() {
        return Ok(vec![]);
    }

    let mut result: Vec<String> = Default::default();
    for row in tables.iter() {
        result.push(row.try_get::<String, usize>(0).unwrap())
    }
    Ok(result)
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
