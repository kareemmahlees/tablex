use crate::default::get_default_keybindings;
use std::path::PathBuf;
use tauri::{Manager, Runtime};
use tx_lib::fs::{create_json_file_recursively, write_into_json};

const KEYBINDINGS_FILE_NAME: &str = "keybindings.json";

/// make sure that `keybindings.json` file exist and if not will create it
/// with the default keybindings.
pub fn ensure_keybindings_file_exist(path: &PathBuf) -> Result<(), String> {
    if path.exists() {
        return Ok(());
    }
    create_json_file_recursively(path)?;
    write_into_json(path, get_default_keybindings())?;
    Ok(())
}

/// Get the file path to `keybindings.json`.
///
/// **Varies by platform**.
pub fn get_keybindings_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Couldn't read config dir path".to_string())?;
    config_dir.push(KEYBINDINGS_FILE_NAME);
    Ok(config_dir)
}
