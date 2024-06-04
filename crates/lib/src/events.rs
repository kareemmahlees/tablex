use serde::{Deserialize, Serialize};
use specta::Type;
use tauri_specta::Event;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct ConnectionsChanged;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct TableContentsChanged;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct SQLDialogOpen;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct CommandPaletteOpen;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct MetaXDialogOpen;

#[derive(Clone, Serialize, Deserialize, Type)]
pub enum ShortcutAction {
    Delete,
    Copy,
    SelectAll,
    FocusSearch,
}

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct Shortcut(pub ShortcutAction);
