use crate::{drivers::sqlite::decode, utils};
use serde_json::{
    value::Value::{Bool as JsonBool, String as JsonString},
    Value as JsonValue,
};
use sqlx::{Pool, Row, Sqlite};
use std::collections::HashMap;

pub async fn get_tables(pool: &Pool<Sqlite>) -> Result<Vec<String>, String> {
    let rows = sqlx::query(
        "SELECT name
    FROM sqlite_schema
    WHERE type ='table' 
    AND name NOT LIKE 'sqlite_%';",
    )
    .fetch_all(pool)
    .await
    .map_err(|err| err.to_string())?;

    if rows.is_empty() {
        return Ok(vec![]);
    }

    let mut result: Vec<String> = vec![];
    for row in rows.iter() {
        result.push(row.get::<String, usize>(0))
    }
    Ok(result)
}

pub async fn get_columns_definition(
    pool: &Pool<Sqlite>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let rows = sqlx::query(
        format!(
            "select name,type,\"notnull\",dflt_value,pk from pragma_table_info('{table_name}');"
        )
        .as_str(),
    )
    .fetch_all(pool)
    .await
    .map_err(|err| err.to_string())?;

    let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    rows.iter().for_each(|row| {
        let column_props = utils::create_column_definition_map(
            JsonString(row.get(1)),
            JsonBool(!row.get::<i16, usize>(2) == 0),
            decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
            JsonBool(row.get::<i16, usize>(4) == 1),
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
