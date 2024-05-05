use crate::state::SharedState;
use sqlx::{AnyConnection, Connection};
use std::path::PathBuf;
#[cfg(feature = "metax")]
use tauri::api::process::{Command, CommandChild};
use tauri::{async_runtime::Mutex, Runtime, State};
use tx_handlers::{mysql::MySQLHandler, postgres::PostgresHandler, sqlite::SQLiteHandler};
use tx_lib::{
    fs::{delete_from_connections_file, read_from_connections_file, write_into_connections_file},
    handler::Handler,
    types::Drivers,
};

#[tauri::command]
pub async fn test_connection(conn_string: String) -> Result<String, String> {
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
        let child = spawn_sidecar(driver, conn_string);
        state.metax = Some(child);
    }

    Ok(())
}

#[cfg(feature = "metax")]
fn spawn_sidecar(driver: Drivers, conn_string: String) -> CommandChild {
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

    let (_, child) = Command::new_sidecar("meta-x")
        .expect("failed to create `meta-x` binary command")
        .args(args)
        .spawn()
        .expect("failed to spawn sidecar");
    child
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

/// Get the file path to `connections.json`.
///
/// **Varies by platform**.
pub fn get_connections_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut config_dir = app
        .path_resolver()
        .app_config_dir()
        .ok_or("Couldn't read config dir path".to_string())?;
    config_dir.push("connections.json");
    Ok(config_dir)
}
