use crate::{
    AppState,
    state::{MetaXStatus, SharedState},
};
use std::{path::PathBuf, sync::Arc};
#[cfg(feature = "metax")]
use tauri::async_runtime::Receiver;
use tauri::{AppHandle, Manager, Runtime, async_runtime::Mutex};
#[cfg(feature = "metax")]
use tauri_plugin_shell::ShellExt;
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_specta::Event;
use tx_handlers::DatabaseConnection;
use tx_lib::{
    Result, TxError,
    events::ConnectionsChanged,
    fs::{create_json_file_recursively, read_from_json, write_into_json},
    types::{ConnConfig, ConnectionsFileSchema, Drivers},
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
    let conn = DatabaseConnection::connect(&conn_string, driver.clone()).await?;
    let main_state = app.state::<Arc<Mutex<SharedState>>>();
    let mut state = main_state.lock().await;

    state.conn = Some(conn);
    state.conn_string = Some(conn_string.clone());

    #[cfg(feature = "metax")]
    {
        use crate::state::{MetaXState, MetaXStatus};

        let (command_child, status) = match spawn_sidecar(&app, driver, conn_string) {
            Err(_) => (None, MetaXStatus::Exited),
            Ok((mut rx, child)) => {
                let shared = main_state.inner().clone();
                tauri::async_runtime::spawn(async move {
                    while let Some(event) = rx.recv().await {
                        match event {
                            CommandEvent::Error(_) | CommandEvent::Terminated(_) => {
                                let mut shared = shared.lock().await;
                                shared.metax.status = MetaXStatus::Exited;
                                shared.metax.command_child = None;
                                break;
                            }
                            CommandEvent::Stderr(_) | CommandEvent::Stdout(_) => {}
                            _ => todo!(),
                        }
                    }
                });
                (Some(child), MetaXStatus::Active)
            }
        };
        state.metax = MetaXState::new(command_child, status);
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn drop_connection(state: AppState<'_>) -> Result<()> {
    state.lock().await.cleanup();

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn kill_metax(_state: AppState<'_>) -> Result<()> {
    #[cfg(feature = "metax")]
    _state.lock().await.metax.kill()?;
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn start_metax(app: AppHandle, _state: AppState<'_>) -> Result<()> {
    #[cfg(feature = "metax")]
    {
        use crate::state::MetaXState;

        let shared = _state.inner().clone();
        let mut state = _state.lock().await;
        let conn = &state.conn;
        let conn_string = state.conn_string.clone().unwrap();
        let driver = match conn.as_ref().unwrap() {
            DatabaseConnection::Sqlite { .. } => Drivers::SQLite,
            DatabaseConnection::Postgres { .. } => Drivers::PostgreSQL,
            DatabaseConnection::Mysql { .. } => Drivers::MySQL,
        };

        let (command_child, status) = match spawn_sidecar(&app, driver, conn_string) {
            Err(_) => (None, MetaXStatus::Exited),
            Ok((mut rx, child)) => {
                tauri::async_runtime::spawn(async move {
                    while let Some(event) = rx.recv().await {
                        match event {
                            CommandEvent::Error(_) | CommandEvent::Terminated(_) => {
                                let mut shared = shared.lock().await;
                                shared.metax.status = MetaXStatus::Exited;
                                shared.metax.command_child = None;
                                break;
                            }
                            CommandEvent::Stderr(_) | CommandEvent::Stdout(_) => {}
                            _ => todo!(),
                        }
                    }
                });
                (Some(child), MetaXStatus::Active)
            }
        };

        state.metax = MetaXState::new(command_child, status);
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn is_metax_build() -> bool {
    cfg!(feature = "metax")
}

#[tauri::command]
#[specta::specta]
pub async fn get_metax_status(_state: AppState<'_>) -> Result<MetaXStatus> {
    let status = if cfg!(feature = "metax") {
        _state.lock().await.metax.status.clone()
    } else {
        MetaXStatus::Exited
    };

    Ok(status)
}

#[cfg(feature = "metax")]
fn spawn_sidecar(
    app: &AppHandle,
    driver: Drivers,
    conn_string: String,
) -> Result<(Receiver<CommandEvent>, CommandChild)> {
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

    let (rx, child) = app
        .shell()
        .sidecar("meta-x")
        .map_err(|_| TxError::MetaXError("failed to create `meta-x` binary command".to_string()))?
        .args(args)
        .spawn()
        .map_err(|_| TxError::MetaXError("failed to spawn meta-x".to_string()))?;

    // tauri::async_runtime::spawn(async move {
    //     // read events such as stdout
    //     while let Some(event) = rx.recv().await {
    //         match event {
    //             CommandEvent::Error(_) | CommandEvent::Terminated(_) => todo!(),
    //             _ => todo!(),
    //         }
    //     }
    // });

    log::debug!("MetaX started");
    Ok((rx, child))
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
