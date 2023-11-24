use crate::utils;
use tauri::Runtime;

#[tauri::command]
pub fn connections_exist<R: Runtime>(app: tauri::AppHandle<R>) -> Result<bool, String> {
    let (_, connections) = utils::read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(connections) => {
            if connections.as_array().unwrap().len() > 0 {
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn get_connections<R: Runtime>(app: tauri::AppHandle<R>) -> Result<serde_json::Value, String> {
    let (_, connections) = utils::read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(conns) => Ok(conns),
        Err(err) => Err(err.to_string()),
    }
}
