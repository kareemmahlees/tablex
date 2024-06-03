use crate::state::SharedState;
use sqlx::{AnyConnection, Connection};
use std::{collections::HashMap, path::PathBuf};
use tauri::{async_runtime::Mutex, AppHandle, Manager, Runtime, State};
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
#[cfg(feature = "metax")]
use tauri_plugin_shell::ShellExt;
use tauri_specta::Event;
use tx_handlers::{mysql::MySQLHandler, postgres::PostgresHandler, sqlite::SQLiteHandler};
use tx_lib::{
    events::ConnectionsChanged,
    fs::{delete_from_connections_file, read_from_connections_file, write_into_connections_file},
    handler::Handler,
    types::{ConnConfig, Drivers},
};

#[tauri::command]
#[specta::specta]
pub async fn test_connection(conn_string: String) -> Result<String, String> {
    let mut con = AnyConnection::connect(conn_string.as_str())
        .await
        .map_err(|_| "Couldn't connect to DB".to_string())?;
    con.ping()
        .await
        .map_err(|_| "DB not responding to Pings".to_string())?;

    let _ = con.close().await;

    Ok("Connection is healthy".into())
}

#[tauri::command]
#[specta::specta]
pub fn create_connection_record(
    app: tauri::AppHandle,
    conn_string: String,
    conn_name: String,
    driver: Drivers,
) -> Result<String, String> {
    let mut connections_file_path = get_connections_file_path(&app)?;
    write_into_connections_file(&mut connections_file_path, driver, conn_string, conn_name)?;
    Ok(String::from("Successfully created connection"))
}

#[tauri::command]
#[specta::specta]
pub fn delete_connection_record(app: tauri::AppHandle, conn_id: String) -> Result<String, String> {
    let mut connections_file_path = get_connections_file_path(&app)?;
    delete_from_connections_file(&mut connections_file_path, conn_id)?;
    ConnectionsChanged.emit(&app).unwrap();
    Ok(String::from("Successfully deleted connection"))
}

#[tauri::command]
#[specta::specta]
pub async fn establish_connection(
    _app: AppHandle,
    state: State<'_, Mutex<SharedState>>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    #[cfg(feature = "metax")]
    {
        if let Some(sidecar) = state.lock().await.metax.take() {
            sidecar.kill().expect("failed to kill sidecar")
        }
    }
    let pool = tx_handlers::establish_connection(&conn_string).await?;

    let handler: Box<dyn Handler> = match driver {
        Drivers::SQLite => Box::new(SQLiteHandler {}),
        Drivers::PostgreSQL => Box::new(PostgresHandler {}),
        Drivers::MySQL => Box::new(MySQLHandler {}),
    };

    let mut state = state.lock().await;

    state.pool = Some(pool);
    state.handler = Some(handler);
    #[cfg(feature = "metax")]
    {
        let child = spawn_sidecar(_app, driver, conn_string);
        state.metax = Some(child);
    }

    Ok(())
}

#[cfg(feature = "metax")]
fn spawn_sidecar(app: AppHandle, driver: Drivers, conn_string: String) -> CommandChild {
    let args = match driver {
        Drivers::SQLite => {
            let (_, after) = conn_string.split_once(':').unwrap();
            vec!["sqlite3", "-f", after]
        }
        Drivers::PostgreSQL => vec!["pg", "--url", conn_string.as_str()],
        Drivers::MySQL => {
            let stripped_conn_string = conn_string.strip_prefix("mysql://").unwrap();

            use regex::Regex;

            let re = Regex::new(r"@(.+?)/").unwrap();

            re.replace_all(stripped_conn_string, |caps: &regex::Captures| {
                format!("@tcp({})/", &caps[1])
            });

            vec!["mysql", "--url", stripped_conn_string]
        }
    };

    let (_, child) = app
        .shell()
        .sidecar("meta-x")
        .expect("failed to create `meta-x` binary command")
        .args(args)
        .spawn()
        .expect("failed to spawn sidecar");
    child
}

#[tauri::command]
#[specta::specta]
pub fn connections_exist(app: tauri::AppHandle) -> Result<bool, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    if connections.is_empty() {
        return Ok(false);
    }
    Ok(true)
}

#[tauri::command]
#[specta::specta]
pub fn get_connections(app: tauri::AppHandle) -> Result<HashMap<String, ConnConfig>, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    Ok(connections)
}

#[tauri::command]
#[specta::specta]
pub fn get_connection_details(
    app: tauri::AppHandle,
    conn_id: String,
) -> Result<ConnConfig, String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_connections_file(&connections_file_path)?;
    let connection_details = connections
        .get(&conn_id)
        .ok_or("Couldn't find the specified connection".to_string())?;
    Ok(connection_details.clone())
}

/// Get the file path to `connections.json`.
///
/// **Varies by platform**.
pub fn get_connections_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Couldn't read config dir path".to_string())?;
    config_dir.push("connections.json");
    Ok(config_dir)
}
