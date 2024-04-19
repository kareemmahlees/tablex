use serde_json::Value as JsonValue;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::Row;
use std::collections::HashMap;
use tauri::{async_runtime::Mutex, State};
use tx_lib::{create_column_definition_map, decode, state::SharedState};

#[tauri::command]
pub async fn get_tables(state: State<'_, Mutex<SharedState>>) -> Result<Vec<String>, String> {
    let state = state.lock().await;
    let handler = state.handler.as_ref().unwrap();
    let tables = handler.get_tables().await?;

    if tables.is_empty() {
        return Ok(vec![]);
    }

    let mut result: Vec<String> = Default::default();
    for row in tables.iter() {
        result.push(row.try_get::<String, usize>(0).unwrap())
    }
    Ok(result)
}

#[tauri::command]
pub async fn get_columns_definition(
    state: State<'_, Mutex<SharedState>>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let state = state.lock().await;
    // let driver = state.driver.as_ref().unwrap();
    // match driver {
    //     Drivers::SQLite => {
    //         let pool = state.sqlite_pool.as_ref().unwrap();
    //         sqlite::table::get_columns_definition(pool, table_name).await
    //     }
    //     Drivers::PostgreSQL => {
    //         let pool = state.postgres_pool.as_ref().unwrap();
    //         postgres::table::get_columns_definition(pool, table_name).await
    //     }
    //     Drivers::MySQL => {
    //         let pool = state.mysql_pool.as_ref().unwrap();
    //         mysql::table::get_columns_definition(pool, table_name).await
    //     }
    // }
    let handler = state.handler.as_ref().unwrap();
    let cols_defs = handler.get_columns_definition(table_name).await?;

    let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    cols_defs.iter().for_each(|row| {
        let column_props = create_column_definition_map(
            JsonString(row.get(1)),
            JsonBool(!row.get::<i16, usize>(2) == 0),
            decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
            JsonBool(row.get::<i16, usize>(4) == 1),
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
