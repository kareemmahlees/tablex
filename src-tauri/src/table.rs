use crate::drivers::sqlite::{get_columns_definition_sqlite, get_tables_sqlite};
use crate::utils;
use crate::utils::Drivers;
use crate::DbInstance;
use serde_json::Value as JsonValue;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::Row;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn get_tables(connection: State<'_, DbInstance>) -> Result<Option<Vec<String>>, ()> {
    let conn_long_lived = connection.pool.lock().await;
    let conn = conn_long_lived.as_ref().unwrap();
    let driver_long_lived = connection.driver.lock().await;
    let driver = driver_long_lived.as_ref().unwrap();

    let query_string = match driver {
        Drivers::SQLite => get_tables_sqlite(),
        Drivers::PostgreSQL => todo!(),
        Drivers::MySQL => todo!(),
    };
    let rows = sqlx::query(query_string).fetch_all(conn).await.unwrap();
    if rows.is_empty() {
        return Ok(None);
    }
    let mut result: Vec<String> = vec![];
    for (_, row) in rows.iter().enumerate() {
        result.push(row.get::<String, &str>("name"))
    }
    Ok(Some(result))
}

#[tauri::command]
pub async fn get_columns_definition(
    connection: State<'_, DbInstance>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let conn_long_lived = connection.pool.lock().await;
    let conn = conn_long_lived.as_ref().unwrap();

    let driver_long_lived = connection.driver.lock().await;
    let driver = driver_long_lived.as_ref().unwrap();

    let query_string = match driver {
        Drivers::SQLite => get_columns_definition_sqlite(table_name),
        Drivers::PostgreSQL => todo!(),
        Drivers::MySQL => todo!(),
    };
    let rows = sqlx::query(query_string.as_str())
        .fetch_all(conn)
        .await
        .map_err(|err| err.to_string())?;

    let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    rows.iter().for_each(|row| {
        let mut column_props = HashMap::<String, JsonValue>::new();
        column_props.insert("type".to_string(), JsonString(row.get(1)));
        column_props.insert(
            "notNull".to_string(),
            if row.get::<i16, usize>(2) == 0 {
                JsonBool(false)
            } else {
                JsonBool(true)
            },
        );
        column_props.insert(
            "defaultValue".to_string(),
            utils::to_json(row.try_get_raw(3).unwrap()).unwrap(),
        );
        column_props.insert(
            "pk".to_string(),
            if row.get::<i16, usize>(4) == 0 {
                JsonBool(false)
            } else {
                JsonBool(true)
            },
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
