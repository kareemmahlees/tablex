use sqlx::sqlite::SqlitePoolOptions;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::State;
use tx_lib::{state::SharedState, Drivers};

pub async fn establish_connection(
    state: &State<'_, Mutex<SharedState>>,
    conn_string: String,
) -> Result<(), String> {
    let pool = SqlitePoolOptions::new()
        .acquire_timeout(Duration::from_secs(5))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    let mut state = state.lock().await;

    state.sqlite_pool = Some(pool);
    state.driver = Some(Drivers::SQLite);
    #[cfg(not(debug_assertions))]
    {
        use tauri::api::process::Command;

        let (_, after) = conn_string.split_once(':').unwrap();
        let (_, child) = Command::new_sidecar("meta-x")
            .expect("failed to create `meta-x` binary command")
            .args(["sqlite3", "-f", after])
            .spawn()
            .expect("failed to spawn sidecar");
        state.metax = Some(child);
    }

    Ok(())
}
