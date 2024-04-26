pub mod decode;
pub mod fs;
pub mod handler;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[serde(rename_all = "lowercase")]
/// Supported drivers, stored inside connection config in `connections.json`.
pub enum Drivers {
    #[default]
    SQLite,
    PostgreSQL,
    MySQL,
}

#[derive(Serialize, Deserialize, Debug)]
/// Connection Config Stored inside `connections.json` file
pub struct ConnConfig {
    driver: Drivers,
    #[serde(rename = "connString")]
    conn_string: String,
    #[serde(rename = "connName")]
    conn_name: String,
}

#[derive(Serialize, Deserialize, Debug, Default, sqlx::FromRow)]
pub struct ColumnProps {
    #[serde(rename = "columnName")]
    pub column_name: String,
    #[serde(rename = "type")]
    pub data_type: JsonValue,
    #[serde(rename = "isNullable")]
    pub is_nullable: JsonValue,
    #[serde(rename = "defaultValue")]
    pub default_value: JsonValue,
    #[serde(rename = "isPK")]
    pub is_pk: JsonValue,
    #[serde(rename = "hasFkRelation")]
    pub has_fk_relation: bool,
}

impl ColumnProps {
    pub fn new(
        column_name: String,
        data_type: JsonValue,
        is_nullable: JsonValue,
        default_value: JsonValue,
        is_pk: JsonValue,
        has_fk_relation: bool,
    ) -> Self {
        ColumnProps {
            column_name,
            data_type,
            is_nullable,
            default_value,
            is_pk,
            has_fk_relation,
        }
    }
}

/// Utility to generate a Map with some data about a column.
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
