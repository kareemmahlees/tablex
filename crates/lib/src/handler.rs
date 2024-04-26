use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use sqlx::{any::AnyRow, AnyPool, Column, Row};
use std::fmt::Debug;

use crate::ColumnProps;

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
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct PaginatedRows {
    data: Vec<JsonMap<String, JsonValue>>,
    #[serde(rename = "pageCount")]
    page_count: i64,
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

        let mut paginated_rows = PaginatedRows::default();

        for row in rows {
            let mut row_data = JsonMap::default();
            for (i, column) in row.columns().iter().enumerate() {
                let v = row.try_get_raw(i).unwrap();

                let v = crate::decode::to_json(v)?;

                row_data.insert(column.name().to_string(), v);
            }

            paginated_rows.data.push(row_data);
        }
        let page_count_result =
            sqlx::query(format!("SELECT COUNT(*) from {}", table_name).as_str())
                .fetch_one(pool)
                .await
                .unwrap();
        let page_count = page_count_result.try_get::<i64, usize>(0).unwrap() / page_size as i64;

        paginated_rows.page_count = page_count;

        Ok(paginated_rows)
    }

    async fn delete_rows(
        &self,
        pool: &AnyPool,
        pk_col_name: String,
        table_name: String,
        params: String,
    ) -> Result<u64, String> {
        let query_str = format!("DELETE FROM {table_name} WHERE {pk_col_name} in ({params});");
        let result = sqlx::query(&query_str)
            .execute(pool)
            .await
            .map_err(|_| "Failed to delete rows".to_string())?;
        Ok(result.rows_affected())
    }
    async fn create_row(
        &self,
        pool: &AnyPool,
        table_name: String,
        columns: String,
        values: String,
    ) -> Result<u64, String> {
        let res =
            sqlx::query(format!("INSERT INTO {table_name} ({columns}) VALUES({values})").as_str())
                .execute(pool)
                .await
                .map_err(|err| err.to_string())?;
        Ok(res.rows_affected())
    }
    async fn update_row(
        &self,
        pool: &AnyPool,
        table_name: String,
        set_condition: String,
        pk_col_name: String,
        pk_col_value: JsonValue,
    ) -> Result<u64, String> {
        let res = sqlx::query(
            format!(
                "UPDATE {table_name} SET {set_condition} WHERE {pk_col_name}={}",
                pk_col_value
            )
            .as_str(),
        )
        .execute(pool)
        .await
        .map_err(|_| "Failed to update row".to_string())?;
        Ok(res.rows_affected())
    }
}
