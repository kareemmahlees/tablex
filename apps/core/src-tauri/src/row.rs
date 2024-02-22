use crate::{
    drivers::{mysql, postgres, sqlite},
    utils::Drivers,
    DbInstance,
};
use serde_json::Map;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::iter::Iterator;
use std::result::Result::Ok;
use tauri::State;

#[tauri::command]
pub async fn get_paginated_rows(
    db: State<'_, DbInstance>,
    table_name: String,
    page_index: u16,
    page_size: u32,
) -> Result<Map<String, JsonValue>, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();
    match driver {
        Drivers::SQLite => {
            sqlite::row::get_paginated_rows(&db, table_name, page_index, page_size).await
        }
        Drivers::PostgreSQL => {
            postgres::row::get_paginated_rows(&db, table_name, page_index, page_size).await
        }
        Drivers::MySQL => {
            mysql::row::get_paginated_rows(&db, table_name, page_index, page_size).await
        }
    }
}

#[tauri::command]
pub async fn delete_rows(
    db: State<'_, DbInstance>,
    pk_col_name: String,
    row_pk_values: Vec<JsonValue>,
    table_name: String,
) -> Result<u64, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();

    let mut params: String = Default::default();
    for val in row_pk_values.iter() {
        // this should cover most cases of primary keys
        if val.is_number() {
            params.push_str(format!("'{}',", val.as_i64().unwrap()).as_str());
        } else {
            params.push_str(format!("'{}',", val.as_str().unwrap()).as_str());
        }
    }
    params.pop(); // to remove the last trailing comma

    match driver {
        Drivers::SQLite => sqlite::row::delete_rows(&db, pk_col_name, table_name, params).await,
        Drivers::PostgreSQL => {
            postgres::row::delete_rows(&db, pk_col_name, table_name, params).await
        }
        Drivers::MySQL => mysql::row::delete_rows(&db, pk_col_name, table_name, params).await,
    }
}

#[tauri::command]
pub async fn create_row(
    db: State<'_, DbInstance>,
    table_name: String,
    data: HashMap<String, JsonValue>,
) -> Result<u64, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();

    let columns = data
        .keys()
        .map(|key| key.to_string())
        .collect::<Vec<String>>()
        .join(",")
        .to_string();
    let mut values = data
        .values()
        .map(|value| value.to_string())
        .collect::<Vec<String>>()
        .join(",")
        .to_string();

    values = values.replace('\"', "'");

    match driver {
        Drivers::SQLite => sqlite::row::create_row(&db, table_name, columns, values).await,
        Drivers::PostgreSQL => postgres::row::create_row(&db, table_name, columns, values).await,
        Drivers::MySQL => mysql::row::create_row(&db, table_name, columns, values).await,
    }
}

#[tauri::command]
pub async fn update_row(
    db: State<'_, DbInstance>,
    table_name: String,
    pk_col_name: String,
    pk_col_value: JsonValue,
    data: Map<String, JsonValue>,
) -> Result<u64, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();

    if data.is_empty() {
        return Ok(0);
    }
    let mut set_condition: String = Default::default();
    for (key, value) in data.iter() {
        set_condition.push_str(format!("{key}={},", value.to_string().replace('\"', "'")).as_str())
    }
    set_condition.pop(); // to remove the trailing comma

    match driver {
        Drivers::SQLite => {
            sqlite::row::update_row(&db, table_name, set_condition, pk_col_name, pk_col_value).await
        }
        Drivers::PostgreSQL => {
            postgres::row::update_row(&db, table_name, set_condition, pk_col_name, pk_col_value)
                .await
        }
        Drivers::MySQL => {
            mysql::row::update_row(&db, table_name, set_condition, pk_col_name, pk_col_value).await
        }
    }
}
