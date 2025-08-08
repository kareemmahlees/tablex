use crate::AppState;
use sea_query::{Cond, Expr, Order, PostgresQueryBuilder};
use sea_query_binder::SqlxBinder;
use sea_schema::sea_query;
use sea_schema::sea_query::{Alias, Asterisk, Iden, Query};
use serde::{Deserialize, Serialize};
use serde_json::Map;
use serde_json::Value as JsonValue;
use specta::Type;
use tauri::AppHandle;
use tauri_specta::Event;
use tx_handlers::{decode_raw_rows, CustomColumnType, DecodedRow, ExecResult, RowRecord};
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

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetRowsPayload {
    table_name: String,
    columns: Vec<ColumnForFor>,
    pagination: PaginationData,
    sorting: Vec<SortingData>,
    filtering: Vec<FilteringData>,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct PaginationData {
    page_index: u64,
    page_size: u64,
}

#[derive(Serialize, Deserialize, Type)]
struct SortingData {
    column: String,
    ordering: ColumnOrdering,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
enum ColumnOrdering {
    Asc,
    Desc,
}

#[derive(Serialize, Deserialize, Type, Debug)]
#[serde(rename_all = "camelCase")]
struct FilteringData {
    column: String,
    filters: Filters,
}

#[derive(Serialize, Deserialize, Type, Debug)]
#[serde(rename_all = "camelCase")]
enum Filters {
    Gt(JsonValue),
    Gte(JsonValue),
    Lt(JsonValue),
    Lte(JsonValue),
    Eq(JsonValue),
    Ne(JsonValue),
    Between(JsonValue, JsonValue),
    Like(String),
    NotLike(String),
    IsEmpty,
    IsNotEmpty,
}

#[derive(Serialize, Deserialize, Type, Debug)]
#[serde(rename_all = "camelCase")]
struct ColumnForFor {
    column_name: String,
    column_type: CustomColumnType,
}

fn json_to_sea_value(jv: &serde_json::Value) -> sea_query::Value {
    match jv {
        serde_json::Value::Bool(b) => sea_query::Value::Bool(Some(*b)),
        serde_json::Value::Number(num) => {
            if let Some(i) = num.as_i64() {
                sea_query::Value::BigInt(Some(i))
            } else if let Some(u) = num.as_u64() {
                sea_query::Value::BigUnsigned(Some(u))
            } else if let Some(f) = num.as_f64() {
                sea_query::Value::Double(Some(f))
            } else {
                sea_query::Value::TinyInt(None)
            }
        }
        serde_json::Value::String(s) => sea_query::Value::String(Some(Box::new(s.clone()))),
        _ => sea_query::Value::String(None),
    }
}

#[tauri::command]
#[specta::specta]
pub async fn get_paginated_rows(
    state: AppState<'_>,
    payload: GetRowsPayload,
) -> Result<PaginatedRows> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let mut query = Query::select()
        .columns(
            payload
                .columns
                .iter()
                .filter(|c| c.column_type != CustomColumnType::Enum(Vec::new()))
                .map(|c| PlainColumn(c.column_name.clone())),
        )
        .exprs(
            payload
                .columns
                .iter()
                .filter(|c| c.column_type == CustomColumnType::Enum(Vec::new()))
                .map(|c| Expr::col(PlainColumn(c.column_name.clone())).as_enum("text")),
        )
        .from(PlainTable(payload.table_name))
        .limit(payload.pagination.page_size)
        .offset(payload.pagination.page_index * payload.pagination.page_size)
        .order_by_columns(payload.sorting.iter().map(|s| {
            (
                PlainColumn(s.column.clone()),
                match s.ordering {
                    ColumnOrdering::Asc => Order::Asc,
                    ColumnOrdering::Desc => Order::Desc,
                },
            )
        }))
        .to_owned();

    payload.filtering.iter().for_each(|f| {
        let expression = Expr::col(PlainColumn(f.column.clone()));
        let simple_express = match &f.filters {
            Filters::Gt(v) => expression.gt(json_to_sea_value(v)),
            Filters::Gte(v) => expression.gte(json_to_sea_value(v)),
            Filters::Lt(v) => expression.lt(json_to_sea_value(v)),
            Filters::Lte(v) => expression.lte(json_to_sea_value(v)),
            Filters::Between(a, b) => {
                expression.between(json_to_sea_value(a), json_to_sea_value(b))
            }
            Filters::Eq(v) => expression.eq(json_to_sea_value(v)),
            Filters::Ne(v) => expression.ne(json_to_sea_value(v)),
            Filters::Like(v) => expression.like(v),
            Filters::NotLike(v) => expression.not_like(v),
            Filters::IsEmpty => expression.is_null(),
            Filters::IsNotEmpty => expression.is_not_null(),
        };

        query.and_where(simple_express);
    });
    let (stmt, values) = query.build_any_sqlx(conn.into_builder().as_ref());
    dbg!(&stmt);

    let rows = conn.fetch_all(&stmt, values).await?;

    let page_count = rows.len().div_ceil(payload.pagination.page_size as usize);

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
