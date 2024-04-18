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
}
impl RowHandler for MySQLHandler {}
