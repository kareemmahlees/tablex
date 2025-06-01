use crate::state::SharedState;
use sea_query_binder::SqlxBinder;
use sea_schema::sea_query;
use sea_schema::sea_query::{Alias, Asterisk, Iden, Query};
use serde::{Deserialize, Serialize};
use serde_json::Map;
use serde_json::Value as JsonValue;
use specta::Type;
use sqlx::types::chrono::{DateTime, Utc};
use tauri::{async_runtime::Mutex, AppHandle, State};
use tauri_specta::Event;
use tx_handlers::{decode_raw_rows, CustomColumnType, DecodedRow, ExecResult};
use tx_lib::{events::TableContentsChanged, types::FKRows, Result};
use uuid::Uuid;

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
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    page_index: u64,
    page_size: u64,
) -> Result<PaginatedRows> {
    let state = state.lock().await;
    let conn = &state.conn;
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

#[derive(Serialize, Deserialize, Type, Clone, Debug)]
pub struct RowData {
    column_name: String,
    value: JsonValue,
    column_type: tx_handlers::CustomColumnType,
}

impl From<RowData> for sea_query::Value {
    fn from(value: RowData) -> Self {
        match value.value {
            JsonValue::Null => match value.column_type {
                CustomColumnType::String | CustomColumnType::Text | CustomColumnType::Year => {
                    sea_query::Value::String(None)
                }
                CustomColumnType::Uuid => sea_query::Value::Uuid(None),
                CustomColumnType::Float => sea_query::Value::Double(None),
                CustomColumnType::PositiveInteger => sea_query::Value::BigInt(None),
                CustomColumnType::Boolean => sea_query::Value::Bool(None),
                CustomColumnType::Integer => sea_query::Value::BigUnsigned(None),
                CustomColumnType::Date => sea_query::Value::ChronoDate(None),
                CustomColumnType::DateTime => sea_query::Value::ChronoDateTime(None),
                CustomColumnType::Time => sea_query::Value::ChronoTime(None),
                CustomColumnType::Json => sea_query::Value::Json(None),
                CustomColumnType::Binary => sea_query::Value::Bytes(None),
                CustomColumnType::Custom => todo!(),
            },
            JsonValue::Bool(v) => sea_query::Value::Bool(Some(v)),
            JsonValue::Number(number) => {
                if number.is_f64() {
                    sea_query::Value::Double(number.as_f64())
                } else if number.is_i64() {
                    sea_query::Value::BigInt(number.as_i64())
                } else if number.is_u64() {
                    sea_query::Value::BigUnsigned(number.as_u64())
                } else {
                    todo!()
                }
            }
            JsonValue::String(v) => match value.column_type {
                CustomColumnType::String | CustomColumnType::Text | CustomColumnType::Year => {
                    sea_query::Value::String(Some(Box::new(v)))
                }
                CustomColumnType::Uuid => {
                    sea_query::Value::Uuid(Some(Box::new(Uuid::parse_str(v.as_str()).unwrap())))
                }
                CustomColumnType::Date => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoDate(Some(Box::new(date.date_naive())))
                }
                CustomColumnType::DateTime => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoDateTime(Some(Box::new(date.naive_utc())))
                }
                CustomColumnType::Time => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoTime(Some(Box::new(date.time())))
                }
                _ => unimplemented!(),
            },
            JsonValue::Array(values) => todo!(),
            JsonValue::Object(map) => {
                sea_query::Value::Json(Some(Box::new(JsonValue::Object(map))))
            }
        }
    }
}

#[tauri::command]
#[specta::specta]
pub async fn create_row(
    app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
    data: Vec<RowData>,
) -> Result<ExecResult> {
    let state = state.lock().await;
    let conn = &state.conn;
    let (stmt, values) = Query::insert()
        .into_table(Alias::new(table_name))
        .columns(data.iter().map(|k| PlainColumn(k.column_name.clone())))
        .values_panic(data.iter().map(|val| {
            dbg!(&val);
            let sea_query_val: sea_query::Value = val.clone().into();
            sea_query::SimpleExpr::Value(sea_query_val)
        }))
        .build_any_sqlx(conn.into_builder().as_ref());

    dbg!(&values);
    let result = conn.execute_with(stmt.as_str(), values).await;
    dbg!(&result);

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
