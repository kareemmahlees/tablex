use crate::TxError;
use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;

pub type Result<T> = std::result::Result<T, TxError>;

#[derive(Serialize, Deserialize, Debug, Default, Clone, Type, sqlx::Type)]
#[serde(rename_all = "lowercase")]
/// Supported drivers, stored inside connection config in `connections.json`.
pub enum Drivers {
    #[default]
    SQLite,
    PostgreSQL,
    MySQL,
}

impl std::fmt::Display for Drivers {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::SQLite => "SQLite",
            Self::PostgreSQL => "PostgreSQL",
            Self::MySQL => "MySQL",
        };
        write!(f, "{s}")
    }
}

#[derive(Serialize, Deserialize, Debug, Type, Clone, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
/// Connection Config Stored inside `connections.json` file.
pub struct ConnConfig {
    pub id: i64,
    pub driver: Drivers,
    pub name: String,
    pub connection_string: String,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow, Type)]
pub struct FkRelation {
    #[serde(rename = "tableName")]
    pub table: String,
    pub to: String,
}

#[derive(Serialize, Deserialize, Debug, Default, Type)]
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
