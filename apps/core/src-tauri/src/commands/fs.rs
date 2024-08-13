use json_patch::merge;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;
use tauri::AppHandle;
use tx_keybindings::{get_keybindings_file_path, Keybinding};
use tx_lib::fs::{read_from_json, write_into_json};
use tx_settings::{get_settings_file_path, Settings};

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ConfigFile {
    Settings,
    Keybindings,
}

// Note: for now this command is only dedicated to opening config files,
// maybe in the future there will be a need to make this command generic for all files,
// but for now there is no need to.
#[tauri::command]
#[specta::specta]
pub fn open_in_external_editor(app: AppHandle, file: ConfigFile) -> Result<(), String> {
    let path = match file {
        ConfigFile::Keybindings => get_keybindings_file_path(&app)?,
        ConfigFile::Settings => get_settings_file_path(&app)?,
    };
    open::that_detached(path).map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn load_settings_file(app: AppHandle) -> Result<Settings, String> {
    let settings = read_from_json::<Value>(&get_settings_file_path(&app)?)?;
    let mut default_settings =
        serde_json::to_value(Settings::default()).map_err(|_| "Serialization error".to_string())?;

    merge(&mut default_settings, &settings);

    let settings = serde_json::from_value::<Settings>(settings)
        .map_err(|_| "Serialization error".to_string())?;
    Ok(settings)
}

#[tauri::command]
#[specta::specta]
pub fn write_into_settings_file(app: AppHandle, settings: Value) -> Result<(), String> {
    let mut stored_settings = read_from_json::<Value>(&get_settings_file_path(&app)?)?;
    merge(&mut stored_settings, &settings);

    write_into_json(&get_settings_file_path(&app)?, stored_settings)?;
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn write_into_keybindings_file(
    app: AppHandle,
    keybindings: Vec<Keybinding>,
) -> Result<(), String> {
    write_into_json(&get_keybindings_file_path(&app)?, keybindings)?;
    Ok(())
}
