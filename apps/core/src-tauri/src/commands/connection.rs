use crate::{state::SharedState, AppState};
use std::path::PathBuf;
use tauri::{async_runtime::Mutex, AppHandle, Manager, Runtime};
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
#[cfg(feature = "metax")]
use tauri_plugin_shell::ShellExt;
use tauri_specta::Event;
use tx_handlers::DatabaseConnection;
use tx_lib::{
    events::ConnectionsChanged,
    fs::{create_json_file_recursively, read_from_json, write_into_json},
    types::{ConnConfig, ConnectionsFileSchema, Drivers},
    Result, TxError,
};
use uuid::Uuid;

const CONNECTIONS_FILE_PATH: &str = if cfg!(debug_assertions) {
    "dev/connections.json"
} else {
    "connections.json"
};

#[tauri::command]
#[specta::specta]
pub async fn test_connection(conn_string: String, driver: Drivers) -> Result<()> {
    let con = DatabaseConnection::connect(conn_string.as_str(), driver).await?;
    con.ping().await?;

    con.close().await;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn create_connection_record(
    app: tauri::AppHandle,
    conn_string: String,
    conn_name: String,
    driver: Drivers,
) -> Result<String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let mut contents = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    let connection = ConnConfig {
        driver,
        conn_string,
        conn_name,
    };
    let id = Uuid::new_v4().to_string();
    contents.insert(id.clone(), connection);

    write_into_json(&connections_file_path, contents)?;
    log::info!(id = id.as_str() ;"New connection created");

    Ok(String::from("Successfully created connection"))
}

#[tauri::command]
#[specta::specta]
pub fn delete_connection_record(app: tauri::AppHandle, conn_id: String) -> Result<String> {
    let connections_file_path = get_connections_file_path(&app)?;
    let mut contents = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;

    contents
        .remove(&conn_id)
        .ok_or(TxError::Io(std::io::ErrorKind::Other.into()))?;

    write_into_json(&connections_file_path, contents)?;
    log::info!(id = conn_id.as_str(); "Connection deleted");

    ConnectionsChanged.emit(&app).unwrap();
    log::debug!("Event emitted: {:?}", ConnectionsChanged);

    Ok(String::from("Successfully deleted connection"))
}

#[tauri::command]
#[specta::specta]
pub async fn establish_connection(
    app: AppHandle,
    conn_string: String,
    driver: Drivers,
) -> Result<()> {
    let state = app.state::<Mutex<SharedState>>();
    let mut state = state.lock().await;
    let conn = DatabaseConnection::connect(&conn_string, driver).await?;

    state.conn = Some(conn);

    #[cfg(feature = "metax")]
    {
        let child = spawn_sidecar(&app, driver, conn_string);
        state.metax = Some(child);
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn drop_connection(state: AppState<'_>) -> Result<()> {
    let mut state = state.lock().await;
    state.cleanup().await;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn kill_metax(_state: AppState<'_>) -> Result<()> {
    #[cfg(feature = "metax")]
    {
        if let Some(metax) = _state.lock().await.metax.take() {
            metax
                .kill()
                .map_err(|_| TxError::MetaXError("Failed to kill metax".to_string()))?;
        }
    }
    Ok(())
}

#[cfg(feature = "metax")]
fn spawn_sidecar(app: &AppHandle, driver: Drivers, conn_string: String) -> CommandChild {
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
pub fn connections_exist(app: tauri::AppHandle) -> Result<bool> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    if connections.is_empty() {
        return Ok(false);
    }
    Ok(true)
}

#[tauri::command]
#[specta::specta]
pub fn get_connections(app: tauri::AppHandle) -> Result<ConnectionsFileSchema> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    Ok(connections)
}

#[tauri::command]
#[specta::specta]
pub fn get_connection_details(app: tauri::AppHandle, conn_id: String) -> Result<ConnConfig> {
    let connections_file_path = get_connections_file_path(&app)?;
    let connections = read_from_json::<ConnectionsFileSchema>(&connections_file_path)?;
    let connection_details = connections
        .get(&conn_id)
        .ok_or(TxError::Io(std::io::ErrorKind::NotFound.into()))?;
    Ok(connection_details.clone())
}

/// Make sure `connections.json` file exist, if not will create an empty json file for it.
pub fn ensure_connections_file_exist(path: &PathBuf) -> Result<()> {
    if path.exists() {
        log::debug!("{} exists, skipping creation.", CONNECTIONS_FILE_PATH);
        return Ok(());
    }
    create_json_file_recursively(path)?;
    Ok(())
}

/// Get the file path to `connections.json`.
///
/// **Varies by platform**.
pub(crate) fn get_connections_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf> {
    let mut config_dir = app.path().app_config_dir()?;

    config_dir.push(CONNECTIONS_FILE_PATH);
    Ok(config_dir)
}
