pub mod decode;
pub mod fs;
pub mod handler;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

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

#[derive(Serialize, Deserialize, Debug, Default)]
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
    #[serde(rename = "hasFkRelations")]
    pub has_fk_relations: JsonValue,
}

impl ColumnProps {
    pub fn new(
        column_name: String,
        data_type: JsonValue,
        is_nullable: JsonValue,
        default_value: JsonValue,
        is_pk: JsonValue,
        has_fk_relations: JsonValue,
    ) -> Self {
        ColumnProps {
            column_name,
            data_type,
            is_nullable,
            default_value,
            is_pk,
            has_fk_relations,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FkRelation {
    #[serde(rename = "tableName")]
    table_name: String,
    to: String,
}

impl FkRelation {
    pub fn new(table_name: String, to: String) -> Self {
        FkRelation { table_name, to }
    }
}
