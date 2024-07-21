use crate::schema::{
    CursorBlinkingStyle, EditorScrollBarVisibility, SQLEditorSettings, Settings, Visibility,
};

pub fn get_default_settings() -> Settings {
    let editor_scrollbar_visibility =
        EditorScrollBarVisibility::new(Visibility::Hidden, Visibility::Visible);
    let sql_editor_settings = SQLEditorSettings::new(
        false,
        18,
        CursorBlinkingStyle::Smooth,
        editor_scrollbar_visibility,
    );
    Settings::new(500, sql_editor_settings)
}
