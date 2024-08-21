use serde_json::{Map, Value as JsonValue};
use sqlx::{AnyPool, Row};
use tx_lib::{decode::decode_raw_rows, types::PaginatedRows, Result};

pub(crate) async fn execute_raw_query(
    pool: &AnyPool,
    query: String,
) -> Result<Vec<Map<String, JsonValue>>> {
    let res = sqlx::query(&query).fetch_all(pool).await?;
    let decoded = decode_raw_rows(res).unwrap();
    Ok(decoded)
}

pub(crate) async fn get_paginated_rows(
    pool: &AnyPool,
    table_name: String,
    page_index: u16,
    page_size: i32,
) -> Result<PaginatedRows> {
    let query_str = format!(
        "SELECT * FROM {} limit {} offset {};",
        table_name,
        page_size,
        page_index as i32 * page_size
    );

    let rows = sqlx::query(&query_str).fetch_all(pool).await?;

    let query_str = format!("SELECT COUNT(*) from {}", table_name);

    let page_count_result = sqlx::query(&query_str).fetch_one(pool).await?;
    let page_count = page_count_result.try_get::<i64, usize>(0).unwrap() as i32 / page_size;

    let paginated_rows = PaginatedRows::new(decode_raw_rows(rows)?, page_count);

    Ok(paginated_rows)
}

pub(crate) async fn delete_rows(
    pool: &AnyPool,
    pk_col_name: String,
    table_name: String,
    params: String,
) -> Result<String> {
    let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");

    let result = sqlx::query(&query_str).execute(pool).await?;

    let mut message = String::from("Successfully deleted ");
    if result.rows_affected() == 1 {
        message.push_str("1 row")
    } else {
        message.push_str(format!("{} rows", result.rows_affected()).as_str())
    }
    Ok(message)
}
pub(crate) async fn create_row(
    pool: &AnyPool,
    table_name: String,
    columns: String,
    values: String,
) -> Result<String> {
    let query_str = format!("INSERT INTO {table_name} ({columns}) VALUES({values})");

    let res = sqlx::query(&query_str).execute(pool).await?;
    Ok(format!("Successfully created {} row", res.rows_affected()))
}
pub(crate) async fn update_row(
    pool: &AnyPool,
    table_name: String,
    set_condition: String,
    pk_col_name: String,
    pk_col_value: JsonValue,
) -> Result<String> {
    let query_str = format!(
        "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
        pk_col_value
    );

    let _ = sqlx::query(&query_str).execute(pool).await?;
    Ok(String::from("Successfully updated row"))
}
