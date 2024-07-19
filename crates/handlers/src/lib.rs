use sqlx::{any::AnyPoolOptions, AnyPool};
use std::time::Duration;

mod handler;
mod mysql;
mod postgres;
mod sqlite;

pub use handler::{Handler, RowHandler, TableHandler};
pub use mysql::MySQLHandler;
pub use postgres::PostgresHandler;
pub use sqlite::SQLiteHandler;

pub async fn establish_connection(conn_string: &str) -> Result<AnyPool, String> {
    let pool = AnyPoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    Ok(pool)
}
