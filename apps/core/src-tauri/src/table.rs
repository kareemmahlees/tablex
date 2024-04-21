use serde_json::Value as JsonValue;
use sqlx::Row;
use std::collections::HashMap;
use tauri::{async_runtime::Mutex, State};
use tx_lib::state::SharedState;

#[tauri::command]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_ref().unwrap();
    let tables = handler.get_tables(pool).await?;

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
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_ref().unwrap();
    let cols_defs = handler.get_columns_definition(pool, table_name).await?;

    Ok(cols_defs)
}
