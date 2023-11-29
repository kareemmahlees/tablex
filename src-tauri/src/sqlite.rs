use crate::DbConnection;
use sqlx::{AnyConnection, Connection, Row};
use std::result::Result::Ok;
use tauri::{Runtime, State};

use crate::utils::{write_into_connections_file, Drivers};

#[tauri::command]
pub async fn test_sqlite_conn(conn_string: String) -> Result<String, String> {
    sqlx::any::install_default_drivers();
    let mut con = AnyConnection::connect(conn_string.as_str())
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
    conn_name: String,
) -> Result<(), String> {
    write_into_connections_file(
        app.path_resolver().app_config_dir(),
        Drivers::SQLITE,
        conn_string,
        conn_name,
    );
    Ok(())
}

#[tauri::command]
pub async fn connect_sqlite(
    connection: State<'_, DbConnection>,
    conn_string: String,
) -> Result<(), String> {
    sqlx::any::install_default_drivers();
    let con = AnyConnection::connect(conn_string.as_str())
        .await
        .map_err(|err| format!("Couldn't connect to db \nerr:{err}\nconn_string:{conn_string}"))
        .unwrap();
    *connection.db.lock().await = Some(con);
    Ok(())
}

#[tauri::command]
pub async fn get_tables(connection: State<'_, DbConnection>) -> Result<Option<Vec<String>>, ()> {
    let mut long_lived = connection.db.lock().await;
    let conn = long_lived.as_mut().unwrap();
    let rows = sqlx::query(
        "SELECT name
         FROM sqlite_schema
         WHERE type ='table' 
         AND name NOT LIKE 'sqlite_%';",
    )
    .fetch_all(conn)
    .await
    .unwrap();
    if rows.len() == 0 {
        ()
    }
    let mut result: Vec<String> = vec![];
    for (idx, row) in rows.iter().enumerate() {
        result.push(row.get::<String, &str>("name"))
    }
    Ok(Some(result))
}
