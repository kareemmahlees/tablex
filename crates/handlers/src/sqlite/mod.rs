use async_trait::async_trait;
use serde_json::Value as JsonValue;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use std::collections::HashMap;
use tx_lib::handler::{Handler, RowHandler, TableHandler};

#[derive(Debug)]
pub struct SQLiteHandler;

impl Handler for SQLiteHandler {}

#[async_trait]
impl TableHandler for SQLiteHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
            "SELECT name
            FROM sqlite_schema
            WHERE type ='table' 
            AND name NOT LIKE 'sqlite_%';",
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
            "select name,type,\"notnull\",dflt_value,pk from pragma_table_info('{table_name}');"
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
                JsonBool(!row.get::<i16, usize>(2) == 0),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<i16, usize>(4) == 1),
            );
            result.insert(row.get(0), column_props);
        });
        Ok(result)
    }
}

#[async_trait]
impl RowHandler for SQLiteHandler {}
