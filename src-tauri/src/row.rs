use crate::{utils, DbInstance};
use serde_json::Map;
use serde_json::Value as JsonValue;
use sqlx::{Column, Row};
use std::collections::HashMap;
use std::iter::Iterator;
use std::result::Result::Ok;
use tauri::State;

#[tauri::command]
pub async fn get_rows(
    connection: State<'_, DbInstance>,
    table_name: String,
) -> Result<Vec<HashMap<String, JsonValue>>, String> {
    let long_lived = connection.pool.lock().await;
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

            let v = utils::to_json(v)?;

            value.insert(column.name().to_string(), v);
        }

        values.push(value);
    }
    Ok(values)
}

#[tauri::command]
pub async fn delete_row(
    connection: State<'_, DbInstance>,
    pk_col_name: String,
    row_pk_values: Vec<JsonValue>,
    table_name: String,
) -> Result<u64, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let params = format!("?{}", ",?".repeat(row_pk_values.len() - 1));
    let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});",);
    let mut query = sqlx::query(&query_str);
    for val in row_pk_values.iter() {
        // this should cover most cases of primary keys
        if val.is_number() {
            query = query.bind(val.as_i64().unwrap());
        } else {
            query = query.bind(val.as_str().unwrap());
        }
    }
    let result = query.execute(conn).await.unwrap();
    Ok(result.rows_affected())
}

#[tauri::command]
pub async fn create_row(
    connection: State<'_, DbInstance>,
    table_name: String,
    data: Map<String, JsonValue>,
) -> Result<u64, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let columns = data
        .keys()
        .map(|key| key.as_str())
        .collect::<Vec<&str>>()
        .join(",")
        .to_string();
    let values = data
        .values()
        .map(|value| value.to_string())
        .collect::<Vec<String>>()
        .join(",")
        .to_string();

    let res =
        sqlx::query(format!("INSERT INTO {table_name} ({columns}) VALUES({values})").as_str())
            .execute(conn)
            .await
            .map_err(|_| "Failed to create row".to_string())?;
    Ok(res.rows_affected())
}

#[tauri::command]
pub async fn update_row(
    connection: State<'_, DbInstance>,
    table_name: String,
    pk_value: i32,
    data: Map<String, JsonValue>,
) -> Result<u64, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    if data.is_empty() {
        return Ok(0);
    }
    let mut set_condition = String::new();
    for (key, value) in data.iter() {
        set_condition.push_str(format!("{key}={value},").as_str())
    }
    set_condition.pop();

    let res = sqlx::query(
        format!("UPDATE {table_name} SET {set_condition} WHERE id={pk_value}").as_str(),
    )
    .execute(conn)
    .await
    .map_err(|_| "Failed to update row".to_string())?;
    Ok(res.rows_affected())
}
