use crate::{
    AppState,
    state::{MetaXStatus, SharedState, Storage},
};
use std::sync::Arc;
#[cfg(feature = "metax")]
use tauri::async_runtime::Receiver;
use tauri::{AppHandle, Manager, State, async_runtime::Mutex};
#[cfg(feature = "metax")]
use tauri_plugin_shell::ShellExt;
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_specta::Event;
use tx_handlers::DatabaseConnection;
use tx_lib::{
    Result, TxError,
    events::ConnectionsChanged,
    types::{ConnConfig, Drivers},
};

#[tauri::command]
#[specta::specta]
pub async fn test_connection(conn_string: String, driver: Drivers) -> Result<()> {
    DatabaseConnection::ping(conn_string.as_str(), &driver).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_connection_record(
    storage: State<'_, Storage>,
    conn_string: String,
    conn_name: String,
    driver: Drivers,
) -> Result<i64> {
    let id = storage
        .insert_connection(conn_string, conn_name, driver)
        .await?;
    log::info!(id = id ;"New connection created");

    Ok(id)
}

#[tauri::command]
#[specta::specta]
pub async fn delete_connection_record(
    storage: State<'_, Storage>,
    app: tauri::AppHandle,
    conn_id: i64,
) -> Result<String> {
    storage.delete_connection(conn_id).await?;

    log::info!(id = conn_id; "Connection deleted");

    ConnectionsChanged.emit(&app).unwrap();
    log::debug!("Event emitted: {:?}", ConnectionsChanged);

    Ok(String::from("Successfully deleted connection"))
}

#[tauri::command]
#[specta::specta]
pub async fn establish_connection(
    app: AppHandle,
    storage: State<'_, Storage>,
    conn_id: i64,
) -> Result<()> {
    let connection = storage.get_connection_by_id(conn_id).await?;
    let conn =
        DatabaseConnection::connect(&connection.connection_string, &connection.driver).await?;
    let main_state = app.state::<Arc<Mutex<SharedState>>>();
    let mut state = main_state.lock().await;

    state.conn = Some(conn);

    #[cfg(feature = "metax")]
    {
        use crate::state::{MetaXState, MetaXStatus};

        let (command_child, status) =
            match spawn_sidecar(&app, &connection.driver, connection.connection_string) {
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
pub async fn start_metax(
    app: AppHandle,
    storage: State<'_, Storage>,
    _state: AppState<'_>,
    conn_id: i64,
) -> Result<()> {
    #[cfg(feature = "metax")]
    {
        use crate::state::MetaXState;

        let shared = _state.inner().clone();
        let mut state = _state.lock().await;
        let connection = storage.get_connection_by_id(conn_id).await?;

        let (command_child, status) =
            match spawn_sidecar(&app, &connection.driver, connection.connection_string) {
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
    #[cfg(feature = "metax")]
    return Ok(_state.lock().await.metax.status.clone());

    #[cfg(not(feature = "metax"))]
    return Ok(MetaXStatus::Exited);
}

#[cfg(feature = "metax")]
fn spawn_sidecar(
    app: &AppHandle,
    driver: &Drivers,
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
pub async fn connections_exist(storage: State<'_, Storage>) -> Result<bool> {
    let connections_count = storage.connections_count().await?;
    if connections_count == 0 {
        return Ok(false);
    }
    Ok(true)
}

#[tauri::command]
#[specta::specta]
pub async fn get_connections(storage: State<'_, Storage>) -> Result<Vec<ConnConfig>> {
    let connections = storage.get_all_connections().await?;
    Ok(connections)
}

#[tauri::command]
#[specta::specta]
pub async fn get_connection_details(
    storage: State<'_, Storage>,
    conn_id: i64,
) -> Result<ConnConfig> {
    let connection = storage.get_connection_by_id(conn_id).await?;
    Ok(connection)
}
