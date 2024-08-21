use async_trait::async_trait;
use serde_json::{Map, Value as JsonValue};
use sqlx::{any::AnyRow, AnyPool, Row};
use std::fmt::Debug;

use tx_lib::{
    decode,
    types::{ColumnProps, FKRows, PaginatedRows},
    Result,
};

/// **Handler** must be implemented by any logic handling service, which is
/// therefore persisted in `SharedState`.
pub trait Handler: TableHandler + RowHandler + Send + Debug + Sync {}

#[async_trait]
/// Every handler must provide it's own implementation of this.
pub trait TableHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>>;
    async fn get_columns_props(&self, table_name: String) -> Result<Vec<ColumnProps>>;

    async fn execute_raw_query(&self, query: String) -> Result<Vec<Map<String, JsonValue>>>;
}

#[async_trait]
/// The logic for this trait is almost identical between all drivers, so default implementation is created.
pub trait RowHandler {
    async fn get_paginated_rows(
        &self,
        pool: &AnyPool,
        table_name: String,
        page_index: u16,
        page_size: i32,
    ) -> Result<PaginatedRows> {
        let query_str = format!(
            "SELECT * FROM {} limit {} offset {};",
            table_name,
            page_size,
            page_index as i32 * page_size
        );

        let rows = sqlx::query(&query_str).fetch_all(pool).await?;

        let query_str = format!("SELECT COUNT(*) from {}", table_name);

        let page_count_result = sqlx::query(&query_str).fetch_one(pool).await?;
        let page_count = page_count_result.try_get::<i64, usize>(0).unwrap() as i32 / page_size;

        let paginated_rows = PaginatedRows::new(decode::decode_raw_rows(rows)?, page_count);

        Ok(paginated_rows)
    }

    async fn delete_rows(
        &self,
        pool: &AnyPool,
        pk_col_name: String,
        table_name: String,
        params: String,
    ) -> Result<String> {
        let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");

        let result = sqlx::query(&query_str).execute(pool).await?;

        let mut message = String::from("Successfully deleted ");
        if result.rows_affected() == 1 {
            message.push_str("1 row")
        } else {
            message.push_str(format!("{} rows", result.rows_affected()).as_str())
        }
        Ok(message)
    }
    async fn create_row(
        &self,
        pool: &AnyPool,
        table_name: String,
        columns: String,
        values: String,
    ) -> Result<String> {
        let query_str = format!("INSERT INTO {table_name} ({columns}) VALUES({values})");

        let res = sqlx::query(&query_str).execute(pool).await?;
        Ok(format!("Successfully created {} row", res.rows_affected()))
    }
    async fn update_row(
        &self,
        pool: &AnyPool,
        table_name: String,
        set_condition: String,
        pk_col_name: String,
        pk_col_value: JsonValue,
    ) -> Result<String> {
        let query_str = format!(
            "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
            pk_col_value
        );

        let _ = sqlx::query(&query_str).execute(pool).await?;
        Ok(String::from("Successfully updated row"))
    }

    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Vec<FKRows>>;
}
