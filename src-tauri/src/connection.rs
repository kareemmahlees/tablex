use crate::{
    drivers::{mysql, postgres, sqlite},
    utils::{read_from_connections_file, write_into_connections_file, Drivers},
    DbInstance,
};
use sqlx::{AnyConnection, Connection};
use tauri::State;

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
    write_into_connections_file(
        app.path_resolver().app_config_dir(),
        driver,
        conn_string,
        conn_name,
    );
    Ok(())
}

#[tauri::command]
pub async fn establish_connection(
    db: State<'_, DbInstance>,
    conn_string: String,
    driver: Drivers,
) -> Result<(), String> {
    match driver {
        Drivers::SQLite => sqlite::connection::establish_connection(&db, conn_string, driver).await,
        Drivers::PostgreSQL => {
            postgres::connection::establish_connection(&db, conn_string, driver).await
        }
        Drivers::MySQL => mysql::connection::establish_connection(&db, conn_string, driver).await,
    }
}

#[tauri::command]
pub fn connections_exist(app: tauri::AppHandle) -> Result<bool, String> {
    let (_, connections) = read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(connections) => {
            if !connections.as_object().unwrap().is_empty() {
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn get_connections(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let (_, connections) = read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(conns) => Ok(conns),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn get_connection_details(
    app: tauri::AppHandle,
    conn_id: String,
) -> Result<serde_json::Value, String> {
    let (_, connections) = read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(conns) => Ok(conns.get(conn_id).unwrap().to_owned()),
        Err(err) => Err(err.to_string()),
    }
}
