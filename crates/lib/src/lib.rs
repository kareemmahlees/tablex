pub mod decode;
pub mod fs;
pub mod handler;
pub mod state;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Drivers {
    #[default]
    SQLite,
    PostgreSQL,
    MySQL,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConnConfig {
    driver: Drivers,
    #[serde(rename = "connString")]
    conn_string: String,
    #[serde(rename = "connName")]
    conn_name: String,
}

/// shared between drivers::$::table.rs
pub fn create_column_definition_map(
    data_type: JsonValue,
    is_nullable: JsonValue,
    default_value: JsonValue,
    is_pk: JsonValue,
) -> HashMap<String, JsonValue> {
    let mut map = HashMap::<String, JsonValue>::new();
    map.insert("type".to_string(), data_type);
    map.insert("isNullable".to_string(), is_nullable);
    map.insert("defaultValue".to_string(), default_value);
    map.insert("isPK".to_string(), is_pk);
    map
}
