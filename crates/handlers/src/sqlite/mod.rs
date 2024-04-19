use crate::{Handler, RowHandler, TableHandler};
use async_trait::async_trait;
use sqlx::{any::AnyRow, AnyPool};

#[derive(Debug)]
pub struct SQLiteHandler {
    pub pool: AnyPool,
}

impl Handler for SQLiteHandler {}

impl RowHandler for SQLiteHandler {}

#[async_trait]
impl TableHandler for SQLiteHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
            "SELECT name
            FROM sqlite_schema
            WHERE type ='table' 
            AND name NOT LIKE 'sqlite_%';",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|err| err.to_string())
    }

    async fn get_columns_definition(&self, table_name: String) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
            format!(
            "select name,type,\"notnull\",dflt_value,pk from pragma_table_info('{table_name}');"
        )
            .as_str(),
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|err| err.to_string())
    }
}
