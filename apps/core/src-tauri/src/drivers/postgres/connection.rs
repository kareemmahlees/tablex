use crate::{state::SharedState, utils::Drivers};
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::State;

pub async fn establish_connection(
    state: &State<'_, Mutex<SharedState>>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    let pool = PgPoolOptions::new()
        .acquire_timeout(Duration::new(5, 0))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    let mut state = state.lock().await;

    state.postgres_pool = Some(pool);
    state.driver = Some(driver);

    #[cfg(not(debug_assertions))]
    {
        use tauri::api::process::Command;

        let (_, child) = Command::new_sidecar("meta-x")
            .expect("failed to create `meta-x` binary command")
            .args(["pg", "--url", conn_string.as_str()])
            .spawn()
            .expect("failed to spawn sidecar");
        state.metax = Some(child);
    }

    Ok(())
}
