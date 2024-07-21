use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
/// The configuration object for TableX's settings.
pub struct Settings {
    /// Remote schema url for autocompletion.
    #[serde(rename = "$schema")]
    schema: Option<String>,
    /// Number of rows to be fetched per page.
    page_size: u32,
    /// Configuration for the SQL editor.
    sql_editor: SQLEditorSettings,
}

impl Settings {
    pub fn new(
        schema: Option<String>,
        page_size: u32,
        sql_editor_settings: SQLEditorSettings,
    ) -> Self {
        Self {
            schema,
            page_size,
            sql_editor: sql_editor_settings,
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

impl SQLEditorSettings {
    pub fn new(
        minimap: bool,
        font_size: u8,
        cursor_blinking: CursorBlinkingStyle,
        scrollbar: EditorScrollBarVisibility,
    ) -> Self {
        Self {
            minimap,
            font_size,
            cursor_blinking,
            scrollbar,
        }
    }
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
