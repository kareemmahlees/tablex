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
