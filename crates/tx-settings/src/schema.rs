use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use specta::Type;

const SCHEMA_URL: &str =
    "https://raw.githubusercontent.com/kareemmahlees/tablex/master/crates/tx-settings/schema.json";

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
/// The configuration object for TableX's settings.
pub struct Settings {
    /// Remote schema url for autocompletion.
    #[serde(rename = "$schema")]
    schema: Option<String>,
    /// Number of rows to be fetched per page.
    pub page_size: u32,
    /// Wether to automatically check for updates or not.
    pub check_for_updates: bool,
    /// Configuration for the SQL editor.
    sql_editor: SQLEditorSettings,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            schema: Some(SCHEMA_URL.to_string()),
            page_size: 500,
            check_for_updates: true,
            sql_editor: SQLEditorSettings {
                font_size: 18,
                vim_mode: true,
            },
        }
    }
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
/// Configuration for the SQL editor.
pub struct SQLEditorSettings {
    /// Editor font size.
    font_size: u8,
    /// Enable vim keybindings in the editor
    vim_mode: bool,
}
