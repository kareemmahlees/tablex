//! # TableX Keybindings
//!
//! This crate contains logic for generating default keybindings
//! and keybindings commands' types which will be generated for the frontend.
//!
//! It doesn't contain any logic regarding tauri commands.

mod default;
mod fs;
mod schema;

pub use fs::{ensure_keybindings_file_exist, get_keybindings_file_path};
pub use schema::{Keybinding, KeybindingCommand};
