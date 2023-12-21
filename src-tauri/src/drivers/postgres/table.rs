use crate::{drivers::postgres::decode, utils, DbInstance};
use serde_json::{
    value::Value::{Bool as JsonBool, String as JsonString},
    Value as JsonValue,
};
use sqlx::Row;
use std::collections::HashMap;
use tauri::State;

pub async fn get_tables(db: &State<'_, DbInstance>) -> Result<Option<Vec<String>>, String> {
    let conn_long_lived = db.postgres_pool.lock().await;
    let conn = conn_long_lived.as_ref().unwrap();

    let rows = sqlx::query(
        "SELECT \"table_name\"
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = 'public';",
    )
    .fetch_all(conn)
    .await
    .map_err(|err| err.to_string())?;

    if rows.is_empty() {
        return Ok(None);
    }

    let mut result: Vec<String> = Default::default();
    for (_, row) in rows.iter().enumerate() {
        result.push(row.try_get::<String, usize>(0).unwrap())
    }
    Ok(Some(result))
}

pub async fn get_columns_definition(
    db: &State<'_, DbInstance>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let long_lived = db.postgres_pool.lock().await;
    let conn = long_lived.as_ref().unwrap();
    let rows = sqlx::query(
        format!(
            "SELECT COL.COLUMN_NAME,
                COL.DATA_TYPE,
                CASE
                                WHEN COL.IS_NULLABLE = 'YES' THEN TRUE
                                ELSE FALSE
                END IS_NULLABLE,
                COL.COLUMN_DEFAULT,
                CASE
                                WHEN TC.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN TRUE
                                ELSE FALSE
                END IS_PK
            FROM INFORMATION_SCHEMA.COLUMNS AS COL
            LEFT JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS CCU ON COL.COLUMN_NAME = CCU.COLUMN_NAME
            LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC ON TC.CONSTRAINT_NAME = CCU.CONSTRAINT_NAME
            WHERE COL.TABLE_NAME = '{table_name}';"
        )
        .as_str(),
    )
    .fetch_all(conn)
    .await
    .map_err(|err| err.to_string())?;

    let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    rows.iter().for_each(|row| {
        let column_props = utils::create_column_definition_map(
            JsonString(row.get(1)),
            JsonBool(row.get::<bool, usize>(2)),
            decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
            JsonBool(row.get::<bool, usize>(4)),
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
