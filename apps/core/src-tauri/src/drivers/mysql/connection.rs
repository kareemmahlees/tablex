use crate::{utils::Drivers, DbInstance};
use sqlx::mysql::MySqlPoolOptions;
use std::time::Duration;
use tauri::{
    api::process::{Command, CommandEvent},
    State,
};

use regex::Regex;

pub async fn establish_connection(
    state: &State<'_, DbInstance>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    let pool = MySqlPoolOptions::new()
        .acquire_timeout(Duration::new(5, 0))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;
    *state.mysql_pool.lock().await = Some(pool);
    *state.driver.lock().await = Some(driver);

    let stripped_conn_string = conn_string.strip_prefix("mysql://").unwrap().to_string();

    let re = Regex::new(r"@(.+?)/").unwrap();
    let output = re.replace_all(&stripped_conn_string, |caps: &regex::Captures| {
        format!("@tcp({})/", &caps[1])
    });

    let (mut rx, child) = Command::new_sidecar("meta-x")
        .expect("failed to create `meta-x` binary command")
        .args(["mysql", "--url", &output])
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
