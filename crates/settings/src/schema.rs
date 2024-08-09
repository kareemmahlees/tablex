use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use specta::Type;

const SCHEMA_URL: &str =
    "https://raw.githubusercontent.com/kareemmahlees/tablex/master/crates/settings/schema.json";

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
/// The configuration object for TableX's settings.
pub struct Settings {
    /// Remote schema url for autocompletion.
    #[serde(rename = "$schema")]
    schema: Option<String>,
    /// Number of rows to be fetched per page.
    page_size: u32,
    /// Wether to automatically check for updates or not.
    check_for_updates: bool,
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
                minimap: true,
                scrollbar: EditorScrollBarVisibility::new(Visibility::Hidden, Visibility::Visible),
                font_size: 18,
                cursor_blinking: CursorBlinkingStyle::Smooth,
            },
        }
    }
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
/// Configuration for the SQL editor.
pub struct SQLEditorSettings {
    /// Visibility of the right-hand-side minimap.
    minimap: bool,
    /// Vertical/Horizontal scrollbar visibility.
    scrollbar: EditorScrollBarVisibility,
    /// Editor font size.
    font_size: u8,
    /// Behavior of the cursor blinking style.
    cursor_blinking: CursorBlinkingStyle,
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
/// Vertical/Horizontal scrollbar visibility.
pub struct EditorScrollBarVisibility {
    /// Toggle vertical scrollbar visibility.
    vertical: Visibility,
    /// Toggle horizontal scrollbar visibility.
    horizontal: Visibility,
}

impl EditorScrollBarVisibility {
    pub fn new(vertical: Visibility, horizontal: Visibility) -> Self {
        Self {
            vertical,
            horizontal,
        }
    }
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "lowercase")]
/// Behavior of the cursor blinking style.
pub enum CursorBlinkingStyle {
    Blink,
    Expand,
    Smooth,
    Solid,
    Phase,
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "lowercase")]
/// General visibility settings.
pub enum Visibility {
    Hidden,
    Visible,
    Auto,
}
