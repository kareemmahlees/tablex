use async_trait::async_trait;
use sqlx::{any::AnyRow, AnyPool};

use crate::{Handler, RowHandler, TableHandler};

#[derive(Debug)]
pub struct PostgresHandler {
    pub pool: AnyPool,
}
impl Handler for PostgresHandler {}

#[async_trait]
impl TableHandler for PostgresHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>, String> {
        let _ = &self.pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query(
            "SELECT \"table_name\"
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = 'public';",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|err| err.to_string())
    }
}

impl RowHandler for PostgresHandler {}
