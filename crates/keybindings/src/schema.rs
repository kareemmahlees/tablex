use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type)]
/// Represents a keybinding record in the keybindings json file.
///
/// It's only used as a type on the frontend and to generate default keybindings, beside that it doesn't have
/// any backend logic involved.
pub struct Keybinding {
    shortcuts: Vec<String>,
    command: KeybindingCommand,
}

impl Keybinding {
    pub fn new(shortcuts: Vec<String>, command: KeybindingCommand) -> Self {
        Self { shortcuts, command }
    }
}

#[derive(Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", untagged)]
pub enum KeybindingCommand {
    Sidebar(Sidebar),
    Table(Table),
}

#[derive(Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Sidebar {
    FocusSearch,
}
#[derive(Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Table {
    DeleteRow,
    CopyRow,
    SelectAll,
}
