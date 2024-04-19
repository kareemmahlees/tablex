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

    async fn get_columns_definition(&self, table_name: String) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
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
    .fetch_all(&self.pool)
    .await
    .map_err(|err| err.to_string())
    }
}

impl RowHandler for PostgresHandler {}
