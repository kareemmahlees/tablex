use crate::drivers::mysql::decode;
use serde_json::value::{Map as JsonMap, Value as JsonValue};
use sqlx::{Column, MySql, Pool, Row};
use tauri::State;

pub async fn get_paginated_rows(
    pool: &Pool<MySql>,
    table_name: String,
    page_index: u16,
    page_size: u32,
) -> Result<JsonMap<String, JsonValue>, String> {
    let rows = sqlx::query(
        format!(
            "SELECT * FROM {} limit {} offset {};",
            table_name,
            page_size,
            page_index as u32 * page_size
        )
        .as_str(),
    )
    .fetch_all(pool)
    .await
    .unwrap();
    let mut values = Vec::new();
    for row in rows {
        let mut value = JsonMap::default();
        for (i, column) in row.columns().iter().enumerate() {
            let v = row.try_get_raw(i).unwrap();

            let v = decode::to_json(v)?;

            value.insert(column.name().to_string(), v);
        }

        values.push(value);
    }
    let page_count_result = sqlx::query(format!("SELECT COUNT(*) from {}", table_name).as_str())
        .fetch_one(pool)
        .await
        .unwrap();
    let page_count = page_count_result.try_get::<u32, usize>(0).unwrap() / page_size;

    let mut result = JsonMap::new();
    result.insert("data".to_string(), values.into());
    result.insert("pageCount".to_string(), page_count.into());

    Ok(result)
}

pub async fn delete_rows(
    pool: &Pool<MySql>,
    pk_col_name: String,
    table_name: String,
    params: String,
) -> Result<u64, String> {
    let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");
    let result = sqlx::query(&query_str)
        .execute(pool)
        .await
        .map_err(|_| "Failed to delete rows".to_string())?;
    Ok(result.rows_affected())
}

pub async fn create_row(
    pool: &Pool<MySql>,
    table_name: String,
    columns: String,
    values: String,
) -> Result<u64, String> {
    let res =
        sqlx::query(format!("INSERT INTO {table_name} ({columns}) VALUES({values})").as_str())
            .execute(pool)
            .await
            .map_err(|err| err.to_string())?;
    Ok(res.rows_affected())
}

pub async fn update_row(
    pool: &Pool<MySql>,
    table_name: String,
    set_condition: String,
    pk_col_name: String,
    pk_col_value: JsonValue,
) -> Result<u64, String> {
    let res = sqlx::query(
        format!(
            "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
            pk_col_value
        )
        .as_str(),
    )
    .execute(pool)
    .await
    .map_err(|_| "Failed to update row".to_string())?;
    Ok(res.rows_affected())
}
