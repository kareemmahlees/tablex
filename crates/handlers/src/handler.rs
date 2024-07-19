use async_trait::async_trait;
use serde_json::{Map, Value as JsonValue};
use sqlx::{any::AnyRow, AnyPool, Row};
use std::fmt::Debug;

use tx_lib::{
    decode::{self, decode_raw_rows},
    types::{ColumnProps, FKRows, PaginatedRows},
};

/// **Handler** must be implemented by any logic handling service, which is
/// therefore persisted in `SharedState`.
pub trait Handler: TableHandler + RowHandler + Send + Debug + Sync {}

#[async_trait]
/// Every handler must provide it's own implementation of this.
pub trait TableHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String>;
    async fn get_columns_props(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Vec<ColumnProps>, String>;

    async fn execute_raw_query(
        &self,
        pool: &AnyPool,
        query: String,
    ) -> Result<Vec<Map<String, JsonValue>>, String> {
        let res = sqlx::query(&query)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;
        let decoded = decode_raw_rows(res).unwrap();
        Ok(decoded)
    }
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
    ) -> Result<PaginatedRows, String> {
        let rows = sqlx::query(
            format!(
                "SELECT * FROM {} limit {} offset {};",
                table_name,
                page_size,
                page_index as i32 * page_size
            )
            .as_str(),
        )
        .fetch_all(pool)
        .await
        .unwrap();

        let page_count_result =
            sqlx::query(format!("SELECT COUNT(*) from {}", table_name).as_str())
                .fetch_one(pool)
                .await
                .map_err(|e| e.to_string())?;
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
    ) -> Result<String, String> {
        let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");
        let result = sqlx::query(&query_str)
            .execute(pool)
            .await
            .map_err(|_| "Failed to delete rows".to_string())?;

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
    ) -> Result<String, String> {
        let res =
            sqlx::query(format!("INSERT INTO {table_name} ({columns}) VALUES({values})").as_str())
                .execute(pool)
                .await
                .map_err(|err| err.to_string())?;
        Ok(format!("Successfully created {} row", res.rows_affected()))
    }
    async fn update_row(
        &self,
        pool: &AnyPool,
        table_name: String,
        set_condition: String,
        pk_col_name: String,
        pk_col_value: JsonValue,
    ) -> Result<String, String> {
        let _ = sqlx::query(
            format!(
                "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
                pk_col_value
            )
            .as_str(),
        )
        .execute(pool)
        .await
        .map_err(|_| "Failed to update row".to_string())?;
        Ok(String::from("Successfully updated row"))
    }

    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Vec<FKRows>, String>;
}
