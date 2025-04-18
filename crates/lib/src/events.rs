use serde::{Deserialize, Serialize};
use specta::Type;
use tauri_specta::Event;

#[derive(Clone, Serialize, Deserialize, Type, Event, Debug)]
pub struct ConnectionsChanged;

#[derive(Clone, Serialize, Deserialize, Type, Event, Debug)]
pub struct TableContentsChanged;
