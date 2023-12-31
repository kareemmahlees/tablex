use crate::{utils::Drivers, DbInstance};
use sqlx::mysql::MySqlPoolOptions;
use std::time::Duration;
use tauri::State;

pub async fn establish_connection(
    db: &State<'_, DbInstance>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    let pool = MySqlPoolOptions::new()
        .acquire_timeout(Duration::new(5, 0))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;
    *db.mysql_pool.lock().await = Some(pool);
    *db.driver.lock().await = Some(driver);
    Ok(())
}
