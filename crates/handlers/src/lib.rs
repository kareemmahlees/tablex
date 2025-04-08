//! # TableX Handlers
//!
//! This crate contains the logic for interacting with the database ( i.e performing queries ) for `sqlite`, `postgres`,
//! and `mysql`..

use home::home_dir;
use sqlx::{any::AnyPoolOptions, AnyPool};
use std::time::Duration;
use tx_lib::{types::Drivers, Result, TxError};

mod database;
mod handler;
mod mysql;
mod postgres;
mod sqlite;
mod types;

pub use database::DatabaseConnection;
pub use handler::{Handler, RowHandler, TableHandler};
pub use mysql::MySQLHandler;
pub use postgres::PostgresHandler;
pub use sqlite::SQLiteHandler;
pub use types::{ColumnInfo, QueryResult, TableInfo};

/// Replaces homedir-relative paths `~` with the users home dir.
fn expand_conn_string(conn_string: &str) -> Result<String> {
    let home_dir = home_dir();

    match home_dir {
        Some(home_dir_path) => {
            let normalized_string = conn_string.replace('~', home_dir_path.to_str().unwrap());
            Ok(normalized_string)
        }
        None => Err(TxError::HomeDirResolution),
    }
}

pub async fn establish_connection(conn_string: &str, driver: &Drivers) -> Result<AnyPool> {
    let conn_string = match driver {
        Drivers::SQLite => expand_conn_string(conn_string)?,
        _ => conn_string.to_string(),
    };

    let pool = AnyPoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(conn_string.as_str())
        .await
        .map_err(|_| TxError::ConnectionError)?;

    Ok(pool)
}
