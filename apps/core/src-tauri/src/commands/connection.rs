use crate::state::SharedState;
use sqlx::{AnyConnection, Connection};
use std::path::PathBuf;
use tauri::{async_runtime::Mutex, AppHandle, Manager, Runtime, State};
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
#[cfg(feature = "metax")]
use tauri_plugin_shell::ShellExt;
use tauri_specta::Event;
use tx_handlers::{Handler, MySQLHandler, PostgresHandler, SQLiteHandler};
use tx_lib::{
    events::ConnectionsChanged,
    fs::{create_json_file_recursively, read_from_json, write_into_json},
    types::{ConnConfig, ConnectionsFileSchema, Drivers},
    TxError,
};
use uuid::Uuid;

const CONNECTIONS_FILE_NAME: &str = "connections.json";

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
) -> Result<String, TxError> {
    let connections_file_path = get_connections_file_path(&app)?;
    let mut contents = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    let connection = ConnConfig {
        driver,
        conn_string,
        conn_name,
    };
    let id = Uuid::new_v4().to_string();
    contents.insert(id, connection);

    write_into_json(&connections_file_path, contents)?;
    Ok(String::from("Successfully created connection"))
}

#[tauri::command]
#[specta::specta]
pub fn delete_connection_record(app: tauri::AppHandle, conn_id: String) -> Result<String, TxError> {
    let connections_file_path = get_connections_file_path(&app)?;
    let mut contents = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;

    contents
        .remove(&conn_id)
        .ok_or(TxError::Io(std::io::ErrorKind::Other.into()))?;

    write_into_json(&connections_file_path, contents)?;
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
pub fn connections_exist(app: tauri::AppHandle) -> Result<bool, TxError> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    if connections.is_empty() {
        return Ok(false);
    }
    Ok(true)
}

#[tauri::command]
#[specta::specta]
pub fn get_connections(app: tauri::AppHandle) -> Result<ConnectionsFileSchema, TxError> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    Ok(connections)
}

#[tauri::command]
#[specta::specta]
pub fn get_connection_details(
    app: tauri::AppHandle,
    conn_id: String,
) -> Result<ConnConfig, TxError> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    let connection_details = connections
        .get(&conn_id)
        .ok_or(TxError::Io(std::io::ErrorKind::NotFound.into()))?;
    Ok(connection_details.clone())
}

/// Make sure `connections.json` file exist, if not will create an empty json file for it.
pub fn ensure_connections_file_exist(path: &PathBuf) -> Result<(), TxError> {
    if path.exists() {
        return Ok(());
    }
    create_json_file_recursively(path)?;
    Ok(())
}

/// Get the file path to `connections.json`.
///
/// **Varies by platform**.
pub(crate) fn get_connections_file_path<R: Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<PathBuf, TxError> {
    let mut config_dir = app.path().app_config_dir()?;
    config_dir.push(CONNECTIONS_FILE_NAME);
    Ok(config_dir)
}
