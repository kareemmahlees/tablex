use crate::decode;
use serde_json::{
    value::Value::{Bool as JsonBool, String as JsonString},
    Value as JsonValue,
};
use sqlx::{Pool, Postgres, Row};
use std::collections::HashMap;
use tx_lib::create_column_definition_map;

pub async fn get_tables(pool: &Pool<Postgres>) -> Result<Vec<String>, String> {
    let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
    let rows = sqlx::query(
        "SELECT \"table_name\"
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = 'public';",
    )
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
    pool: &Pool<Postgres>,
    table_name: String,
) -> Result<HashMap<String, HashMap<String, JsonValue>>, String> {
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
    .fetch_all(pool)
    .await
    .map_err(|err| err.to_string())?;

    let mut result = HashMap::<String, HashMap<String, JsonValue>>::new();

    rows.iter().for_each(|row| {
        let column_props = create_column_definition_map(
            JsonString(row.get(1)),
            JsonBool(row.get::<bool, usize>(2)),
            decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
            JsonBool(row.get::<bool, usize>(4)),
        );
        result.insert(row.get(0), column_props);
    });
    Ok(result)
}
