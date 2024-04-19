pub mod mysql;
pub mod postgres;
pub mod sqlite;

use async_trait::async_trait;
use sqlx::{
    any::{AnyPoolOptions, AnyRow},
    AnyPool,
};
use std::{fmt::Debug, time::Duration};

pub trait Handler: TableHandler + RowHandler + Send + Debug {}

pub trait RowHandler {}

#[async_trait]
pub trait TableHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>, String>;
    async fn get_columns_definition(&self, table_name: String) -> Result<Vec<AnyRow>, String>;
}

pub async fn establish_connection(conn_string: &String) -> Result<AnyPool, String> {
    let pool = AnyPoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    Ok(pool)
}
