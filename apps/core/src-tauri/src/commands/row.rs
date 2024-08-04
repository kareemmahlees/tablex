use crate::state::SharedState;
use serde_json::Map;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use tauri::{async_runtime::Mutex, AppHandle, State};
use tauri_specta::Event;
use tx_lib::events::TableContentsChanged;
use tx_lib::types::{FKRows, PaginatedRows};

#[tauri::command]
#[specta::specta]
pub async fn get_paginated_rows(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    page_index: u16,
    page_size: i32,
) -> Result<PaginatedRows, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_deref().unwrap();

    handler
        .get_paginated_rows(pool, table_name, page_index, page_size)
        .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_rows(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    pk_col_name: String,
    row_pk_values: Vec<JsonValue>,
    table_name: String,
) -> Result<String, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_deref().unwrap();

    let mut params: String = Default::default();
    for val in row_pk_values.iter() {
        // this should cover most cases of primary keys
        if val.is_number() {
            params.push_str(format!("'{}',", val.as_i64().unwrap()).as_str());
        } else {
            params.push_str(format!("'{}',", val.as_str().unwrap()).as_str());
        }
    }
    params.pop(); // to remove the last trailing comma

    let result = handler
        .delete_rows(pool, pk_col_name, table_name, params)
        .await;
    if result.is_ok() {
        TableContentsChanged.emit(&app).unwrap()
    }
    result
}

#[tauri::command]
#[specta::specta]
pub async fn create_row(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    data: HashMap<String, JsonValue>,
) -> Result<String, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_deref().unwrap();

    let columns = data
        .keys()
        .map(|key| key.to_string())
        .collect::<Vec<String>>()
        .join(",")
        .to_string();
    let values = data
        .values()
        .map(|value| {
            // Hack: handle json quotation marks until a better
            // solution is found.
            let mut value = value.to_string();
            if value.starts_with("\"{") && value.ends_with("}\"") {
                value = serde_json::from_str::<String>(value.as_str()).unwrap();
                value = format!("'{value}'").to_string();
            } else {
                value = value.replace('\"', "'");
            }
            value
        })
        .collect::<Vec<String>>()
        .join(",")
        .to_string();

    let result = handler.create_row(pool, table_name, columns, values).await;
    if result.is_ok() {
        TableContentsChanged.emit(&app).unwrap();
    }
    result
}

#[tauri::command]
#[specta::specta]
pub async fn update_row(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    pk_col_name: String,
    pk_col_value: JsonValue,
    data: Map<String, JsonValue>,
) -> Result<String, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_deref().unwrap();

    if data.is_empty() {
        return Ok(String::new());
    }
    let mut set_condition: String = Default::default();
    for (key, value) in data.iter() {
        set_condition.push_str(format!("{key}={},", value.to_string().replace('\"', "'")).as_str())
    }
    set_condition.pop(); // to remove the trailing comma

    let result = handler
        .update_row(pool, table_name, set_condition, pk_col_name, pk_col_value)
        .await;
    if result.is_ok() {
        TableContentsChanged.emit(&app).unwrap();
    }
    result
}

#[tauri::command]
#[specta::specta]
pub async fn get_fk_relations(
    state: tauri::State<'_, Mutex<SharedState>>,
    table_name: String,
    column_name: String,
    cell_value: JsonValue,
) -> Result<Vec<FKRows>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().unwrap();
    let handler = state.handler.as_deref().unwrap();

    handler
        .fk_relations(pool, table_name, column_name, cell_value)
        .await
}
