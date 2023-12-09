use crate::{utils, DbInstance};
use serde_json::Map;
use serde_json::Value as JsonValue;
use sqlx::{AnyConnection, Column, Connection, Row};
use std::collections::HashMap;
use std::iter::Iterator;
use std::result::Result::Ok;
use std::vec;
use tauri::{Runtime, State};

use crate::utils::{write_into_connections_file, Drivers};

#[tauri::command]
pub async fn test_sqlite_conn(conn_string: String) -> Result<String, String> {
    sqlx::any::install_default_drivers();
    let mut con = AnyConnection::connect(conn_string.as_str())
        .await
        .map_err(|_| "Couldn't connect to DB".to_string())?;
    let _ = con
        .ping()
        .await
        .map_err(|_| "DB not responding to Pings".to_string())?;

    let _ = con.close().await;

    Ok("Connection is healthy".to_string())
}

#[tauri::command]
pub fn create_sqlite_connection<R: Runtime>(
    app: tauri::AppHandle<R>,
    conn_string: String,
    conn_name: String,
) -> Result<(), String> {
    write_into_connections_file(
        app.path_resolver().app_config_dir(),
        Drivers::SQLITE,
        conn_string,
        conn_name,
    );
    Ok(())
}

#[tauri::command]
pub async fn connect_sqlite(
    connection: State<'_, DbInstance>,
    conn_string: String,
) -> Result<(), String> {
    sqlx::any::install_default_drivers();
    *connection.pool.lock().await = Some(sqlx::AnyPool::connect(&conn_string).await.unwrap());
    Ok(())
}

#[tauri::command]
pub async fn get_tables(connection: State<'_, DbInstance>) -> Result<Option<Vec<String>>, ()> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();
    let rows = sqlx::query(
        "SELECT name
         FROM sqlite_schema
         WHERE type ='table' 
         AND name NOT LIKE 'sqlite_%';",
    )
    .fetch_all(conn)
    .await
    .unwrap();
    if rows.len() == 0 {
        ()
    }
    let mut result: Vec<String> = vec![];
    for (_, row) in rows.iter().enumerate() {
        result.push(row.get::<String, &str>("name"))
    }
    Ok(Some(result))
}

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
pub async fn get_columns(
    connection: State<'_, DbInstance>,
    table_name: String,
) -> Result<Vec<String>, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();
    let rows = sqlx::query(format!("SELECT name FROM PRAGMA_TABLE_INFO('{table_name}')").as_str())
        .fetch_all(conn)
        .await
        .unwrap();
    let mut columns: Vec<String> = vec![];
    rows.iter()
        .enumerate()
        .for_each(|(_, row)| columns.push(row.get(0)));
    Ok(columns)
}

#[tauri::command]
pub async fn delete_row(
    connection: State<'_, DbInstance>,
    col: String,
    pk_row_values: Vec<i32>,
    table_name: String,
) -> Result<u64, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    // check that table has primary key
    let res = sqlx::query(
        format!("select name from pragma_table_info('{table_name}') where pk;").as_str(),
    )
    .fetch_all(conn)
    .await
    .map_err(|err| err.to_string())?;
    if res.len() == 0 {
        Err("Table doesn't have a primary key".to_string())
    } else {
        let params = format!("?{}", ",?".repeat(pk_row_values.len() - 1));
        let query_str = format!("DELETE FROM {table_name} WHERE {col} in ({params});",);
        let mut query = sqlx::query(&query_str);
        for val in pk_row_values.iter() {
            query = query.bind(val);
        }
        let result = query.execute(conn).await.unwrap();
        Ok(result.rows_affected())
    }
}

#[tauri::command]
pub async fn create_row(
    connection: State<'_, DbInstance>,
    table_name: String,
    data: Map<String, JsonValue>,
) -> Result<u64, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let columns = format!(
        "{}",
        data.keys()
            .map(|key| key.as_str())
            .collect::<Vec<&str>>()
            .join(",")
    );
    let values = format!(
        "{}",
        data.values()
            .map(|value| value.to_string())
            .collect::<Vec<String>>()
            .join(",")
    );

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

    if data.len() == 0 {
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

#[tauri::command]
pub async fn get_columns_definition(
    connection: State<'_, DbInstance>,
    table_name: String,
) -> Result<HashMap<String, String>, String> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();

    let rows =
        sqlx::query(format!("select name,type from pragma_table_info('{table_name}') ;").as_str())
            .fetch_all(conn)
            .await
            .map_err(|err| err.to_string())?;

    let mut result = HashMap::<String, String>::new();

    rows.iter().for_each(|row| {
        result.insert(row.get(0), row.get(1));
    });
    Ok(result)
}
