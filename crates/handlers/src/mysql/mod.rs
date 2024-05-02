use async_trait::async_trait;
use serde_json::Value::{self as JsonValue, Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use tx_lib::handler::{Handler, RowHandler, TableHandler};
use tx_lib::{ColumnProps, FKRows, FkRelation};

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
    async fn get_columns_props(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Vec<ColumnProps>, String> {
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

        let mut columns = Vec::new();

        rows.iter().for_each(|row| {
            let column_name = row.get::<String, usize>(0);

            let column_props = ColumnProps::new(
                column_name,
                JsonString(row.get(1)),
                JsonBool(row.get::<i16, usize>(2) == 1),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<i16, usize>(4) == 1),
                // TODO change
                JsonBool(true),
            );

            columns.push(column_props);
        });
        Ok(columns)
    }
}

#[async_trait]
impl RowHandler for MySQLHandler {
    // TODO refactor
    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Option<Vec<FKRows>>, String> {
        Ok(None)
    }
}
