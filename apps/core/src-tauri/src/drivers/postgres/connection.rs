use crate::{utils::Drivers, DbInstance};
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
use tauri::State;

pub async fn establish_connection(
    state: &State<'_, DbInstance>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    let pool = PgPoolOptions::new()
        .acquire_timeout(Duration::new(5, 0))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;
    *state.postgres_pool.lock().await = Some(pool);
    *state.driver.lock().await = Some(driver);

    #[cfg(not(debug_assertions))]
    {
        use tauri::api::process::Command;

        let (_, child) = Command::new_sidecar("meta-x")
            .expect("failed to create `meta-x` binary command")
            .args(["pg", "--url", conn_string.as_str()])
            .spawn()
            .expect("failed to spawn sidecar");
        *state.metax_command_child.lock().await = Some(child);
    }

    Ok(())
}
