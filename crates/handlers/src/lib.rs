use sqlx::{any::AnyPoolOptions, AnyPool};
use std::time::Duration;

pub mod mysql;
pub mod postgres;
pub mod sqlite;

pub async fn establish_connection(conn_string: &String) -> Result<AnyPool, String> {
    let pool = AnyPoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    Ok(pool)
}
