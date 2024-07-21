use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(rename = "$schema")]
    schema: Option<String>,
    page_size: u32,
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
pub struct SQLEditorSettings {
    minimap: bool,
    scrollbar: EditorScrollBarVisibility,
    font_size: u8,
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
pub struct EditorScrollBarVisibility {
    vertical: Visibility,
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
pub enum CursorBlinkingStyle {
    Blink,
    Expand,
    Smooth,
    Solid,
    Phase,
}

#[derive(Serialize, Deserialize, Type, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum Visibility {
    Hidden,
    Visible,
    Auto,
}
