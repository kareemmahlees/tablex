use crate::{
    drivers::{mysql, postgres, sqlite},
    utils::Drivers,
    DbInstance,
};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn get_tables(db: State<'_, DbInstance>) -> Result<Option<Vec<String>>, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();
    match driver {
        Drivers::SQLite => sqlite::table::get_tables(&db).await,
        Drivers::PostgreSQL => postgres::table::get_tables(&db).await,
        Drivers::MySQL => mysql::table::get_tables(&db).await,
    }
}

#[tauri::command]
pub async fn get_columns_definition(
    db: State<'_, DbInstance>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let long_lived = db.driver.lock().await;
    let driver = long_lived.as_ref().unwrap();

    match driver {
        Drivers::SQLite => sqlite::table::get_columns_definition(&db, table_name).await,
        Drivers::PostgreSQL => postgres::table::get_columns_definition(&db, table_name).await,
        Drivers::MySQL => mysql::table::get_columns_definition(&db, table_name).await,
    }
}
