// use crate::default::get_default_keybindings;
use std::path::PathBuf;
use tauri::{Manager, Runtime};
use tx_lib::{
    fs::{create_json_file_recursively, write_into_json},
    TxError,
};

use crate::Settings;

pub const SETTINGS_FILE_NAME: &str = "settings.json";

/// make sure that `settings.json` file exist and if not will create it
/// with the default settings.
pub fn ensure_settings_file_exist(path: &PathBuf) -> Result<(), TxError> {
    if path.exists() {
        log::debug!("{} exists, skipping creation.", SETTINGS_FILE_NAME);
        return Ok(());
    }
    create_json_file_recursively(path)?;

    write_into_json(path, Settings::default())?;
    log::info!("Wrote default settings to {}", SETTINGS_FILE_NAME);

    Ok(())
}

/// Get the file path to `settings.json`.
///
/// **Varies by platform**.
pub fn get_settings_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, TxError> {
    let mut config_dir = app.path().app_config_dir()?;

    #[cfg(debug_assertions)]
    config_dir.push("dev");

    config_dir.push(SETTINGS_FILE_NAME);
    Ok(config_dir)
}
