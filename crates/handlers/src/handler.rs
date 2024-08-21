use async_trait::async_trait;
use serde_json::{Map, Value as JsonValue};
use sqlx::{any::AnyRow, AnyPool};
use std::fmt::Debug;

use tx_lib::{
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
        table_name: String,
        page_index: u16,
        page_size: i32,
    ) -> Result<PaginatedRows>;

    async fn delete_rows(
        &self,
        pk_col_name: String,
        table_name: String,
        params: String,
    ) -> Result<String>;
    async fn create_row(
        &self,
        table_name: String,
        columns: String,
        values: String,
    ) -> Result<String>;
    async fn update_row(
        &self,
        table_name: String,
        set_condition: String,
        pk_col_name: String,
        pk_col_value: JsonValue,
    ) -> Result<String>;

    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Vec<FKRows>>;
}
