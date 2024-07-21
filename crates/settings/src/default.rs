use crate::schema::{
    CursorBlinkingStyle, EditorScrollBarVisibility, SQLEditorSettings, Settings, Visibility,
};

const SCHEMA_URL: &str =
    "https://raw.githubusercontent.com/kareemmahlees/tablex/master/crates/settings/schema.json";

pub fn get_default_settings() -> Settings {
    let editor_scrollbar_visibility =
        EditorScrollBarVisibility::new(Visibility::Hidden, Visibility::Visible);
    let sql_editor_settings = SQLEditorSettings::new(
        false,
        18,
        CursorBlinkingStyle::Smooth,
        editor_scrollbar_visibility,
    );
    Settings::new(Some(SCHEMA_URL.to_string()), 500, sql_editor_settings)
}
