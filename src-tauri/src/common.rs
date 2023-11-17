use crate::utils;
use tauri::Runtime;

#[tauri::command]
pub fn connections_exist<R: Runtime>(app: tauri::AppHandle<R>) -> Result<bool, String> {
    let (_, connections) = utils::read_from_connections_file(app.path_resolver().app_config_dir());
    match connections {
        Ok(_) => Ok(true),
        Err(err) => Err(err.to_string()),
    }
}
