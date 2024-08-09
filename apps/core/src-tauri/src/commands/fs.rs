use json_patch::merge;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;
use tauri::AppHandle;
use tx_keybindings::get_keybindings_file_path;
use tx_lib::fs::read_from_json;
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
    let mut settings = read_from_json::<Value>(&get_settings_file_path(&app)?)?;
    let default_settings =
        serde_json::to_value(Settings::default()).map_err(|_| "Serialization error".to_string())?;

    merge(&mut settings, &default_settings);

    let settings = serde_json::from_value::<Settings>(settings)
        .map_err(|_| "Serialization error".to_string())?;
    Ok(settings)
}
