use tauri::async_runtime::Mutex;

use mysql;
use postgres;
use sqlite;
use sqlx::{AnyConnection, Connection};
use tauri::State;
use tx_lib::{
    delete_from_connections_file, get_connections_file_path, read_from_connections_file,
    state::SharedState, write_into_connections_file, Drivers,
};

#[tauri::command]
pub async fn test_connection(conn_string: String) -> Result<String, String> {
    sqlx::any::install_default_drivers();
    let mut con = AnyConnection::connect(conn_string.as_str())
        .await
        .map_err(|_| "Couldn't connect to DB".to_string())?;
    con.ping()
        .await
        .map_err(|_| "DB not responding to Pings".to_string())?;

    let _ = con.close().await;

    Ok("Connection is healthy".to_string())
}

#[tauri::command]
pub fn create_connection_record(
    app: tauri::AppHandle,
    conn_string: String,
    conn_name: String,
    driver: Drivers,
) -> Result<(), String> {
    let mut connections_file_path = get_connections_file_path(&app)?;
    write_into_connections_file(&mut connections_file_path, driver, conn_string, conn_name)?;
    Ok(())
}

#[tauri::command]
pub fn delete_connection_record(app: tauri::AppHandle, conn_id: String) -> Result<(), String> {
    let mut connections_file_path = get_connections_file_path(&app)?;
    delete_from_connections_file(&mut connections_file_path, conn_id)?;
    Ok(())
}

#[tauri::command]
pub async fn establish_connection(
    state: State<'_, Mutex<SharedState>>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    #[cfg(not(debug_assertions))]
    {
        if let Some(sidecar) = state.lock().await.metax.take() {
            sidecar.kill().expect("failed to kill sidecar")
        }
    }
    match driver {
        Drivers::SQLite => sqlite::connection::establish_connection(&state, conn_string).await,
        Drivers::PostgreSQL => {
            postgres::connection::establish_connection(&state, conn_string).await
        }
        Drivers::MySQL => mysql::connection::establish_connection(&state, conn_string).await,
    }
}

#[tauri::command]
pub fn connections_exist(app: tauri::AppHandle) -> Result<bool, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    if !connections.as_object().unwrap().is_empty() {
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub fn get_connections(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    Ok(connections)
}

#[tauri::command]
pub fn get_connection_details(
    app: tauri::AppHandle,
    conn_id: String,
) -> Result<serde_json::Value, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    let connection_details = connections
        .get(conn_id)
        .ok_or("Couldn't find the specified connection".to_string())?
        .to_owned();
    Ok(connection_details)
}
