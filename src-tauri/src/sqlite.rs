use sqlx::{Connection, SqliteConnection};
use tauri::Runtime;

use crate::utils::{write_into_connections_file, Drivers};

#[tauri::command]
pub async fn test_sqlite_conn(conn_string: String) -> Result<String, String> {
    let mut con = SqliteConnection::connect(conn_string.as_str())
        .await
        .map_err(|_| "Couldn't connect to DB".to_string())?;
    let _ = con
        .ping()
        .await
        .map_err(|_| "DB not responding to Pings".to_string())?;

    let _ = con.close().await;

    Ok("Connection is healthy".to_string())
}

#[tauri::command]
pub fn create_sqlite_connection<R: Runtime>(
    app: tauri::AppHandle<R>,
    conn_string: String,
) -> Result<(), String> {
    write_into_connections_file(
        app.path_resolver().app_config_dir(),
        Drivers::SQLITE,
        conn_string,
    );
    Ok(())
}
