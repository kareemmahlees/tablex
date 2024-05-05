use crate::state::SharedState;
use sqlx::Row;
use tauri::{async_runtime::Mutex, State};
use tx_lib::types::ColumnProps;

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
pub async fn get_columns_props(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
) -> Result<Vec<ColumnProps>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_ref().unwrap();
    let cols_defs = handler.get_columns_props(pool, table_name).await?;

    Ok(cols_defs)
}
