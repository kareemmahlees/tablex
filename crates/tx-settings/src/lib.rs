//! # Tablex Settings
//! This crates holds the logic for generating default settings
//! to be consumed by the frontend.

mod fs;
mod schema;

pub use fs::{SETTINGS_FILE_PATH, ensure_settings_file_exist, get_settings_file_path};
pub use schema::{SCHEMA_URL, Settings};
use serde_json::Value;

/// Adds the missing fields from `patch` into `base`
pub fn merge_add_missing(base: &mut Value, patch: &Value) {
    if let (Value::Object(base_map), Value::Object(patch_map)) = (base, patch) {
        for (k, v_patch) in patch_map {
            match base_map.get_mut(k) {
                Some(v_base) => merge_add_missing(v_base, v_patch), // recurse
                None => {
                    base_map.insert(k.clone(), v_patch.clone()); // add missing
                }
            }
        }
    }
}
