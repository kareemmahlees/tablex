//! # Tablex Settings
//! This crates holds the logic for generating default settings
//! to be consumed by the frontend.

mod fs;
mod schema;

pub use fs::{ensure_settings_file_exist, get_settings_file_path, SETTINGS_FILE_NAME};
pub use schema::Settings;
