use crate::{
    drivers::{postgres, sqlite},
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
        Drivers::MySQL => unimplemented!(),
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
        Drivers::MySQL => todo!(),
    }
    // let rows = sqlx::query(&query_string)
    //     .fetch_all(conn)
    //     .await
    //     .map_err(|err| err.to_string())?;

    // let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    // rows.iter().for_each(|row| {
    //     let mut column_props = HashMap::<String, JsonValue>::new();
    //     column_props.insert("type".to_string(), JsonString(row.get(1)));
    //     column_props.insert(
    //         "isNullable".to_string(),
    //         match driver {
    //             Drivers::SQLite => JsonBool(!row.get::<i16, usize>(2) == 0),
    //             _ => JsonBool(row.get::<bool, usize>(2)),
    //         },
    //     );
    //     column_props.insert(
    //         "defaultValue".to_string(),
    //         utils::to_json(row.try_get_raw(3).unwrap()).unwrap(),
    //     );
    //     column_props.insert(
    //         "pk".to_string(),
    //         match driver {
    //             Drivers::SQLite => JsonBool(row.get::<i16, usize>(4) == 0),
    //             _ => JsonBool(row.get::<bool, usize>(4)),
    //         },
    //     );
    //     result.insert(row.get(0), column_props);
    // });
    // Ok(result)
}
