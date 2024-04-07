use crate::state::SharedState;
use sqlx::mysql::MySqlPoolOptions;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::State;
use tx_lib::Drivers;

pub async fn establish_connection(
    state: &State<'_, Mutex<SharedState>>,
    conn_string: String,
) -> Result<(), String> {
    let pool = MySqlPoolOptions::new()
        .acquire_timeout(Duration::from_secs(1))
        .test_before_acquire(true)
        .connect(&conn_string)
        .await
        .map_err(|_| "Couldn't establish connection to db".to_string())?;

    let mut state = state.lock().await;

    state.mysql_pool = Some(pool);
    state.driver = Some(Drivers::MySQL);

    #[cfg(not(debug_assertions))]
    {
        use regex::Regex;
        use tauri::api::process::Command;

        let stripped_conn_string = conn_string.strip_prefix("mysql://").unwrap().to_string();

        let re = Regex::new(r"@(.+?)/").unwrap();
        let output = re.replace_all(&stripped_conn_string, |caps: &regex::Captures| {
            format!("@tcp({})/", &caps[1])
        });

        let (_, child) = Command::new_sidecar("meta-x")
            .expect("failed to create `meta-x` binary command")
            .args(["mysql", "--url", &output])
            .spawn()
            .expect("failed to spawn sidecar");
        state.metax = Some(child);
    }
    Ok(())
}
