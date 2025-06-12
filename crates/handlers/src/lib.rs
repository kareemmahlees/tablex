//! # TableX Handlers
//!
//! This crate contains the logic for interacting with the database ( i.e performing queries ) for `sqlite`, `postgres`,
//! and `mysql`..

use home::home_dir;
use sqlx::{any::AnyPoolOptions, AnyPool};
use std::time::Duration;
use tx_lib::{types::Drivers, Result, TxError};

mod database;
mod db_schema;
mod handler;
mod mysql;
mod postgres;
mod query;
mod sqlite;

pub use database::DatabaseConnection;
pub use db_schema::{ColumnInfo, ColumnRecord, CustomColumnType, IdenJsonValue, TableInfo};
pub use handler::{Handler, RowHandler, TableHandler};
pub use mysql::MySQLHandler;
pub use postgres::PostgresHandler;
pub use query::{DecodedRow, ExecResult, QueryResult, QueryResultRow};
pub use sqlite::SQLiteHandler;

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

/// Transform/Decode a `Vec<AnyRow>` into a serializable datastructure.
///
/// Typically used with `SELECT *`.
pub fn decode_raw_rows(rows: Vec<QueryResult>) -> Result<Vec<DecodedRow>> {
    let mut result = Vec::<DecodedRow>::new();

    for row in rows {
        match row.row {
            QueryResultRow::SqlxMySql(my_sql_row) => result.push(my_sql_row.into()),
            QueryResultRow::SqlxPostgres(pg_row) => result.push(pg_row.into()),
            QueryResultRow::SqlxSqlite(sqlite_row) => result.push(sqlite_row.into()),
        }
    }
    Ok(result)
}
