use async_trait::async_trait;
use serde_json::Value as JsonValue;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use std::collections::HashMap;
use tx_lib::handler::{Handler, RowHandler, TableHandler};

#[derive(Debug)]
pub struct MySQLHandler;

impl Handler for MySQLHandler {}

#[async_trait]
impl TableHandler for MySQLHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query("show tables;")
            .fetch_all(pool)
            .await
            .map_err(|err| err.to_string())
    }
    async fn get_columns_definition(
        &self,
        pool: &AnyPool,
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
            let column_props = tx_lib::create_column_definition_map(
                JsonString(row.get(1)),
                JsonBool(row.get::<i16, usize>(2) == 1),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<i16, usize>(4) == 1),
            );
            result.insert(row.get(0), column_props);
        });
        Ok(result)
    }
}

#[async_trait]
impl RowHandler for MySQLHandler {}
