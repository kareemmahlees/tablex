use crate::{utils::Drivers, DbInstance};
use sqlx::sqlite::SqlitePoolOptions;
use std::time::Duration;
use tauri::{
    api::process::{Command, CommandEvent},
    State,
};

pub async fn establish_connection(
    state: &State<'_, DbInstance>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    let pool = SqlitePoolOptions::new()
        .acquire_timeout(Duration::new(5, 0))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;
    *state.sqlite_pool.lock().await = Some(pool);
    *state.driver.lock().await = Some(driver);
    let (_, after) = conn_string.split_once(":").unwrap();
    let (mut rx, child) = Command::new_sidecar("meta-x")
        .expect("failed to create `meta-x` binary command")
        .args(["sqlite3", "-f", after])
        .spawn()
        .expect("failed to spawn sidecar");

    #[cfg(debug_assertions)]
    {
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line) = &event {
                    println!("{line}")
                }
                if let CommandEvent::Stderr(line) = &event {
                    println!("{line}")
                }
            }
        });
    }
    *state.metax_command_child.lock().await = Some(child);

    Ok(())
}
