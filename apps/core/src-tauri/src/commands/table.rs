use crate::state::SharedState;
use serde_json::{Map, Value};
use tauri::{async_runtime::Mutex, State};
use tx_handlers::ColumnInfo;
use tx_lib::Result;

#[tauri::command]
#[specta::specta]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>> {
    let state = state.lock().await;
    let conn = &state.conn;
    let tables = conn.get_tables().await;

    Ok(tables.0)
}

#[tauri::command]
#[specta::specta]
pub async fn get_columns_props(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
) -> Result<Vec<ColumnInfo>> {
    let state = state.lock().await;
    let conn = &state.conn;
    let tables = conn.discover().await.tables;
    dbg!(&tables);

    let cols = tables.iter().find(|t| t.name == table_name).unwrap();

    Ok(cols.columns.clone())
}

#[tauri::command]
#[specta::specta]
pub async fn execute_raw_query(
    state: State<'_, Mutex<SharedState>>,
    query: String,
) -> Result<Map<String, Value>> {
    let state = state.lock().await;
    let conn = &state.conn;

    // let result = conn.fetch_all(query).await?;

    Ok(Map::default())
}
