use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::AppHandle;
use tx_keybindings::get_keybindings_file_path;
use tx_settings::get_settings_file_path;

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
