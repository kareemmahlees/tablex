pub mod decode;
pub mod fs;
pub mod handler;

use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};

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
    pub data_type: sqlx::types::JsonValue,
    #[serde(rename = "isNullable")]
    pub is_nullable: sqlx::types::JsonValue,
    #[serde(rename = "defaultValue")]
    pub default_value: sqlx::types::JsonValue,
    #[serde(rename = "isPK")]
    pub is_pk: sqlx::types::JsonValue,
    #[serde(rename = "hasFkRelations")]
    pub has_fk_relations: sqlx::types::JsonValue,
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

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct FkRelation {
    #[serde(rename = "tableName")]
    pub table: String,
    pub to: String,
}

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct FKRows {
    pub table_name: String,
    pub rows: Vec<JsonMap<String, JsonValue>>,
}

impl FKRows {
    pub fn new(table_name: String, rows: Vec<JsonMap<String, JsonValue>>) -> Self {
        FKRows { table_name, rows }
    }
}
