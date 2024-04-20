use async_trait::async_trait;
use serde_json::Value as JsonValue;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use std::collections::HashMap;
use tx_lib::handler::{Handler, RowHandler, TableHandler};

#[derive(Debug)]
pub struct PostgresHandler;
impl Handler for PostgresHandler {}

#[async_trait]
impl TableHandler for PostgresHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query(
            "SELECT \"table_name\"
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = 'public';",
        )
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
            let column_props = tx_lib::create_column_definition_map(
                JsonString(row.get(1)),
                JsonBool(row.get::<bool, usize>(2)),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<bool, usize>(4)),
            );
            result.insert(row.get(0), column_props);
        });
        Ok(result)
    }
}

#[async_trait]
impl RowHandler for PostgresHandler {}
