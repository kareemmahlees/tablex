use crate::{drivers::mysql::decode, DbInstance};
use serde_json::value::Value as JsonValue;
use sqlx::{Column, Row};
use std::collections::HashMap;
use tauri::State;

pub async fn get_rows(
    db: &State<'_, DbInstance>,
    table_name: String,
) -> Result<Vec<HashMap<String, JsonValue>>, String> {
    let long_lived = db.mysql_pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let rows = sqlx::query(format!("SELECT * FROM {};", table_name).as_str())
        .fetch_all(conn)
        .await
        .unwrap();
    let mut values = Vec::new();
    for row in rows {
        let mut value = HashMap::default();
        for (i, column) in row.columns().iter().enumerate() {
            let v = row.try_get_raw(i).unwrap();

            let v = decode::to_json(v)?;

            value.insert(column.name().to_string(), v);
        }

        values.push(value);
    }
    Ok(values)
}

pub async fn delete_rows(
    db: &State<'_, DbInstance>,
    pk_col_name: String,
    table_name: String,
    params: String,
) -> Result<u64, String> {
    let long_lived = db.mysql_pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");
    let result = sqlx::query(&query_str)
        .execute(conn)
        .await
        .map_err(|_| "Failed to delete rows".to_string())?;
    Ok(result.rows_affected())
}

pub async fn create_row(
    db: &State<'_, DbInstance>,
    table_name: String,
    columns: String,
    values: String,
) -> Result<u64, String> {
    let long_lived = db.mysql_pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let res =
        sqlx::query(format!("INSERT INTO {table_name} ({columns}) VALUES({values})").as_str())
            .execute(conn)
            .await
            .map_err(|err| err.to_string())?;
    Ok(res.rows_affected())
}

pub async fn update_row(
    db: &State<'_, DbInstance>,
    table_name: String,
    set_condition: String,
    pk_col_name: String,
    pk_col_value: JsonValue,
) -> Result<u64, String> {
    let long_lived = db.mysql_pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let res = sqlx::query(
        format!(
            "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
            pk_col_value
        )
        .as_str(),
    )
    .execute(conn)
    .await
    .map_err(|_| "Failed to update row".to_string())?;
    Ok(res.rows_affected())
}
