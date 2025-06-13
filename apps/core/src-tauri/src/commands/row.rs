use crate::AppState;
use sea_query::{Cond, Expr, ExprTrait};
use sea_query_binder::SqlxBinder;
use sea_schema::sea_query;
use sea_schema::sea_query::{Alias, Asterisk, Iden, Query};
use serde::{Deserialize, Serialize};
use serde_json::Map;
use serde_json::Value as JsonValue;
use specta::Type;
use tauri::AppHandle;
use tauri_specta::Event;
use tx_handlers::{decode_raw_rows, DecodedRow, ExecResult, RowRecord};
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

struct PlainTable(String);

impl Iden for PlainTable {
    fn unquoted(&self, s: &mut dyn std::fmt::Write) {
        write!(s, "{}", self.0).unwrap();
    }
}

struct PlainColumn(String);

impl Iden for PlainColumn {
    fn unquoted(&self, s: &mut dyn std::fmt::Write) {
        write!(s, "{}", self.0).unwrap();
    }
}

#[tauri::command]
#[specta::specta]
pub async fn get_paginated_rows(
    state: AppState<'_>,
    table_name: String,
    page_index: u64,
    page_size: u64,
) -> Result<PaginatedRows> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let (stmt, values) = Query::select()
        .column(Asterisk)
        .from(PlainTable(table_name))
        .limit(page_size)
        .offset(page_index * page_size)
        .build_any_sqlx(conn.into_builder().as_ref());

    let rows = conn.fetch_all(&stmt, values).await?;

    let page_count = rows.len().div_ceil(page_size as usize);

    let paginated_rows = PaginatedRows::new(decode_raw_rows(rows).unwrap(), page_count);

    Ok(paginated_rows)
}

#[tauri::command]
#[specta::specta]
pub async fn delete_rows(
    app_handle: AppHandle,
    state: AppState<'_>,
    pk_cols: Vec<Vec<RowRecord>>,
    table_name: String,
) -> Result<ExecResult> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();

    let mut delete_condition = Cond::any();

    for matrix in pk_cols {
        let mut sub_condition = Cond::all();
        for record in matrix {
            sub_condition =
                sub_condition.add(Expr::col(PlainColumn(record.column_name.clone())).eq(record))
        }

        delete_condition = delete_condition.add(sub_condition);
    }

    let (stmt, values) = Query::delete()
        .from_table(PlainTable(table_name))
        .cond_where(delete_condition)
        .build_any_sqlx(conn.into_builder().as_ref());

    let result = conn.execute_with(stmt.as_str(), values).await;

    if result.is_ok() {
        TableContentsChanged.emit(&app_handle).unwrap();
        log::debug!("Event emitted: {:?}", TableContentsChanged);
    }

    result
}

#[tauri::command]
#[specta::specta]
pub async fn create_row(
    app: AppHandle,
    state: AppState<'_>,
    table_name: String,
    data: Vec<RowRecord>,
) -> Result<ExecResult> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let (stmt, values) = Query::insert()
        .into_table(Alias::new(table_name))
        .columns(data.iter().map(|k| PlainColumn(k.column_name.clone())))
        .values_panic(data.iter().map(|val| {
            let sea_query_val: sea_query::Value = val.clone().into();
            sea_query::SimpleExpr::Value(sea_query_val)
        }))
        .build_any_sqlx(conn.into_builder().as_ref());

    let result = conn.execute_with(stmt.as_str(), values).await;

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
    state: AppState<'_>,
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
    state: AppState<'_>,
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
