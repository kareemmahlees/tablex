use crate::{drivers::mysql::decode, utils};
use serde_json::{
    value::Value::{Bool as JsonBool, String as JsonString},
    Value as JsonValue,
};
use sqlx::{MySql, Pool, Row};
use std::collections::HashMap;

pub async fn get_tables(pool: &Pool<MySql>) -> Result<Vec<String>, String> {
    let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
    let rows = sqlx::query("show tables;")
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

    if rows.is_empty() {
        return Ok(vec![]);
    }

    let mut result: Vec<String> = Default::default();
    for row in rows.iter() {
        result.push(row.try_get::<String, usize>(0).unwrap())
    }
    Ok(result)
}

pub async fn get_columns_definition(
    pool: &Pool<MySql>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
    let rows = sqlx::query(
        format!(
            "SELECT cols.column_name,
                    cols.data_type,
                    if(cols.is_nullable = \"YES\", TRUE, FALSE) AS is_nullable,
                    cols.column_default,
                    if(kcu.constraint_name = 'PRIMARY', TRUE, FALSE) AS is_pk
            FROM information_schema.columns AS cols
            LEFT JOIN information_schema.key_column_usage AS kcu ON cols.column_name = kcu.column_name
            WHERE cols.table_name = \"{table_name}\";"
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
            JsonBool(row.get::<i16, usize>(2) == 1),
            decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
            JsonBool(row.get::<i16, usize>(4) == 1),
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
