use crate::state::SharedState;
use sea_schema::sea_query::Alias;
use sea_schema::sea_query::Asterisk;
use sea_schema::sea_query::Query;
use serde::{Deserialize, Serialize};
use serde_json::Map;
use serde_json::Value as JsonValue;
use specta::Type;
use std::collections::HashMap;
use tauri::{async_runtime::Mutex, AppHandle, State};
use tauri_specta::Event;
use tx_handlers::decode_raw_rows;
use tx_handlers::DecodedRow;
use tx_handlers::ExecResult;
use tx_lib::{events::TableContentsChanged, types::FKRows, Result};

#[derive(Serialize, Deserialize, Default, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedRows {
    pub data: Vec<DecodedRow>,
    pub page_count: usize,
}

impl PaginatedRows {
    pub fn new(data: Vec<DecodedRow>, page_count: usize) -> Self {
        PaginatedRows { data, page_count }
    }
}

#[tauri::command]
#[specta::specta]
pub async fn get_paginated_rows(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    page_index: u16,
    page_size: u64,
) -> Result<PaginatedRows> {
    let state = state.lock().await;
    let conn = &state.conn;
    let (stmt, _) = Query::select()
        .column(Asterisk)
        // .exprs([Expr::val("from"), Expr::val(table_name)])
        .from(Alias::new(table_name))
        .limit(page_size)
        .offset(page_index as u64 * page_size)
        .build_any(conn.into_builder().as_ref());

    let rows = conn.fetch_all(&stmt).await?;

    let page_count = rows.len().div_ceil(page_size as usize);

    let paginated_rows = PaginatedRows::new(decode_raw_rows(rows).unwrap(), page_count);

    Ok(paginated_rows)
}

#[tauri::command]
#[specta::specta]
pub async fn delete_rows(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    pk_col_name: String,
    row_pk_values: Vec<JsonValue>,
    table_name: String,
) -> Result<String> {
    let state = state.lock().await;
    let conn = &state.conn;

    // let mut params: String = Default::default();
    // for val in row_pk_values.iter() {
    //     // this should cover most cases of primary keys
    //     if val.is_number() {
    //         params.push_str(format!("'{}',", val.as_i64().unwrap()).as_str());
    //     } else {
    //         params.push_str(format!("'{}',", val.as_str().unwrap()).as_str());
    //     }
    // }
    // params.pop(); // to remove the last trailing comma

    // let stmt = Query::delete()
    //     .from_table(Alias::new(table_name))
    //     .cond_where(Expr::col(Alias::new()));

    // let result = handler
    //     .delete_rows(pool, pk_col_name, table_name, params)
    //     .await;
    // if result.is_ok() {
    //     TableContentsChanged.emit(&app).unwrap();
    //     log::debug!("Event emitted: {:?}", TableContentsChanged);
    // }
    // result
    Ok(String::default())
}

#[tauri::command]
#[specta::specta]
pub async fn create_row(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    data: HashMap<String, JsonValue>,
) -> Result<ExecResult> {
    let state = state.lock().await;
    let conn = &state.conn;
    let (stmt, _) = Query::insert()
        .into_table(Alias::new(table_name))
        .columns(data.keys().map(Alias::new))
        .values_panic(data.values().map(|v| v.to_string().into()))
        .build_any(conn.into_builder().as_ref());

    let result = conn.execute(stmt.as_str()).await;

    if result.is_ok() {
        TableContentsChanged.emit(&app).unwrap();
        log::debug!("Event emitted: {:?}", TableContentsChanged);
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
) -> Result<String> {
    let state = state.lock().await;
    // let pool = &state.pool;
    // let handler = &state.handler;

    if data.is_empty() {
        return Ok(String::new());
    }
    let mut set_condition: String = Default::default();
    for (key, value) in data.iter() {
        set_condition.push_str(format!("{key}={},", value.to_string().replace('\"', "'")).as_str())
    }
    set_condition.pop(); // to remove the trailing comma

    // let result = handler
    //     .update_row(pool, table_name, set_condition, pk_col_name, pk_col_value)
    //     .await;
    // if result.is_ok() {
    //     TableContentsChanged.emit(&app).unwrap();
    //     log::debug!("Event emitted: {:?}", TableContentsChanged);
    // }
    // result
    Ok(String::default())
}

#[tauri::command]
#[specta::specta]
pub async fn get_fk_relations(
    state: tauri::State<'_, Mutex<SharedState>>,
    table_name: String,
    column_name: String,
    cell_value: JsonValue,
) -> Result<Vec<FKRows>> {
    let state = state.lock().await;
    // let pool = &state.pool;
    // let handler = &state.handler;

    // handler
    //     .fk_relations(pool, table_name, column_name, cell_value)
    //     .await
    Ok(vec![])
}
