use json_patch::merge;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;
use tx_keybindings::{get_keybindings_file_path, Keybinding};
use tx_lib::{
    fs::{read_from_json, write_into_json},
    TxError,
};
use tx_settings::{get_settings_file_path, Settings};

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ConfigFile {
    Settings,
    Keybindings,
    Logs,
}

// Note: for now this command is only dedicated to opening config files,
// maybe in the future there will be a need to make this command generic for all files,
// but for now there is no need to.
#[tauri::command]
#[specta::specta]
pub fn open_in_external_editor(app: AppHandle, file: ConfigFile) -> Result<(), TxError> {
    let path = match file {
        ConfigFile::Keybindings => get_keybindings_file_path(&app)?,
        ConfigFile::Settings => get_settings_file_path(&app)?,
        ConfigFile::Logs => app.path().app_log_dir()?,
    };
    log::debug!("Opening {} in external editor.", path.to_str().unwrap());
    app.opener()
        .open_path(path.to_str().unwrap(), None::<&str>)
        .unwrap();
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn load_settings_file(app: AppHandle) -> Result<Settings, TxError> {
    let settings = read_from_json::<Value>(&get_settings_file_path(&app)?)?;
    let mut default_settings = serde_json::to_value(Settings::default())?;

    merge(&mut default_settings, &settings);

    let settings = serde_json::from_value::<Settings>(settings)?;

    log::debug!("Loaded settings.");

    Ok(settings)
}

#[tauri::command]
#[specta::specta]
pub fn write_into_settings_file(app: AppHandle, settings: Value) -> Result<(), TxError> {
    let mut stored_settings = read_from_json::<Value>(&get_settings_file_path(&app)?)?;
    merge(&mut stored_settings, &settings);

    let parsed_settings = serde_json::from_value::<Settings>(stored_settings)?;

    if parsed_settings.page_size > 2000 {
        log::warn!(page_size = parsed_settings.page_size;"Setting page size to a high value can cause performance issues.");
    };

    write_into_json(&get_settings_file_path(&app)?, parsed_settings)?;
    log::info!("Settings updated.");
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn write_into_keybindings_file(
    app: AppHandle,
    keybindings: Vec<Keybinding>,
) -> Result<(), TxError> {
    write_into_json(&get_keybindings_file_path(&app)?, keybindings)?;
    log::info!("Keybindings updated.");

    Ok(())
}
