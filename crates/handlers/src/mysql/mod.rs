use async_trait::async_trait;
use sqlx::{any::AnyRow, AnyPool};

use crate::{Handler, RowHandler, TableHandler};

#[derive(Debug)]
pub struct MySQLHandler {
    pub pool: AnyPool,
}

impl Handler for MySQLHandler {}

#[async_trait]
impl TableHandler for MySQLHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>, String> {
        let _ = &self.pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query("show tables;")
            .fetch_all(&self.pool)
            .await
            .map_err(|err| err.to_string())
    }
    async fn get_columns_definition(&self, table_name: String) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
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
    .fetch_all(&self.pool)
    .await
    .map_err(|err| err.to_string())
    }
}
impl RowHandler for MySQLHandler {}
