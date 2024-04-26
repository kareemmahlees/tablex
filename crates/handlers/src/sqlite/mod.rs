use async_trait::async_trait;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use tx_lib::handler::{Handler, RowHandler, TableHandler};
use tx_lib::ColumnProps;

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

    async fn get_columns_props(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Vec<ColumnProps>, String> {
        let rows = sqlx::query(
            format!(
            "select name,type,\"notnull\",dflt_value,pk from pragma_table_info('{table_name}');"
        )
            .as_str(),
        )
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

        let mut columns = Vec::new();

        rows.iter().for_each(|row| {
            let column_props = ColumnProps::new(
                row.get(0),
                JsonString(row.get(1)),
                JsonBool(!row.get::<i16, usize>(2) == 0),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<i16, usize>(4) == 1),
                false,
            );

            columns.push(column_props);
        });
        Ok(columns)
    }
}

#[async_trait]
impl RowHandler for SQLiteHandler {}
