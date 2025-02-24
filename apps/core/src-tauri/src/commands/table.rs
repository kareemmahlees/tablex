use crate::state::SharedState;
use serde_json::{Map, Value};
use sqlx::Row;
use tauri::{async_runtime::Mutex, State};
use tx_lib::{types::ColumnProps, Result};

#[tauri::command]
#[specta::specta]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>> {
    let state = state.lock().await;
    let pool = &state.pool;
    let handler = &state.handler;
    let tables = handler.get_tables(pool, &state.conn).await?;

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
#[specta::specta]
pub async fn get_columns_props(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
) -> Result<Vec<ColumnProps>> {
    let state = state.lock().await;
    let pool = &state.pool;
    let handler = &state.handler;
    let cols_defs = handler.get_columns_props(pool, table_name).await?;

    Ok(cols_defs)
}

#[tauri::command]
#[specta::specta]
pub async fn execute_raw_query(
    state: State<'_, Mutex<SharedState>>,
    query: String,
) -> Result<Vec<Map<String, Value>>> {
    let state = state.lock().await;
    let pool = &state.pool;
    let handler = &state.handler;

    let result = handler.execute_raw_query(pool, query).await?;

    Ok(result)
}
