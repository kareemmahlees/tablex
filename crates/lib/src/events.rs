use serde::{Deserialize, Serialize};
use specta::Type;
use tauri_specta::Event;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct ConnectionsChanged;

#[derive(Clone, Serialize, Deserialize, Type, Event)]
pub struct TableContentsChanged;
