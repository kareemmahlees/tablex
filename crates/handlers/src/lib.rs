//! # TableX Handlers
//!
//! This crate contains the logic for interacting with the database ( i.e performing queries ) for `sqlite`, `postgres`,
//! and `mysql`..

use sqlx::{any::AnyPoolOptions, AnyPool};
use std::time::Duration;
use tx_lib::{Result, TxError};

mod handler;
mod mysql;
mod postgres;
mod shared_queries;
mod sqlite;

pub use handler::{Handler, RowHandler, TableHandler};
pub use mysql::MySQLHandler;
pub use postgres::PostgresHandler;
pub use sqlite::SQLiteHandler;

pub async fn establish_connection(conn_string: &str) -> Result<AnyPool> {
    let pool = AnyPoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(conn_string)
        .await
        .map_err(|_| TxError::ConnectionError)?;

    Ok(pool)
}
