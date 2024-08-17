use std::collections::HashMap;

use crate::{
    decode::{self, DataType},
    TxError,
};
use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;
use sqlx::{any::AnyRow, Error, FromRow, Row};

pub type Result<T> = std::result::Result<T, TxError>;

#[derive(Serialize, Deserialize, Debug, Default, Clone, Type)]
#[serde(rename_all = "lowercase")]
/// Supported drivers, stored inside connection config in `connections.json`.
pub enum Drivers {
    #[default]
    SQLite,
    PostgreSQL,
    MySQL,
}

#[derive(Serialize, Deserialize, Debug, Type, Clone)]
#[serde(rename_all = "camelCase")]
/// Connection Config Stored inside `connections.json` file.
pub struct ConnConfig {
    pub driver: Drivers,
    pub conn_string: String,
    pub conn_name: String,
}

pub type ConnectionsFileSchema = HashMap<String, ConnConfig>;

#[derive(Serialize, Deserialize, Default, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedRows {
    data: Vec<JsonMap<String, JsonValue>>,
    page_count: i32,
}

impl PaginatedRows {
    pub fn new(data: Vec<JsonMap<String, JsonValue>>, page_count: i32) -> Self {
        PaginatedRows { data, page_count }
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Type)]
pub struct ColumnProps {
    #[serde(rename = "columnName")]
    pub column_name: String,
    #[serde(rename = "type")]
    pub data_type: DataType,
    #[serde(rename = "isNullable")]
    pub is_nullable: bool,
    #[serde(rename = "defaultValue")]
    pub default_value: JsonValue,
    #[serde(rename = "isPK")]
    pub is_pk: bool,
    #[serde(rename = "hasFkRelations")]
    pub has_fk_relations: bool,
}
impl<'r> FromRow<'r, AnyRow> for ColumnProps {
    fn from_row(row: &'r AnyRow) -> std::result::Result<Self, Error> {
        let column_name: String = row.try_get("column_name")?;
        let data_type: DataType = decode::to_data_type(row.try_get_raw("data_type")?);
        let is_nullable = match row.try_get::<i16, &str>("is_nullable") {
            Ok(val) => val == 1,
            Err(_) => row.try_get::<bool, &str>("is_nullable")?,
        };
        let default_value: JsonValue = decode::to_json(row.try_get_raw("default_value")?).unwrap();
        let is_pk = match row.try_get::<i16, &str>("is_pk") {
            Ok(val) => val == 1,
            Err(_) => row.try_get::<bool, &str>("is_pk")?,
        };
        let has_fk_relations: bool = match row.try_get::<i16, &str>("has_fk_relations") {
            Ok(val) => val == 1,
            Err(_) => row.try_get::<bool, &str>("has_fk_relations")?,
        };

        Ok(ColumnProps {
            column_name,
            data_type,
            is_nullable,
            default_value,
            is_pk,
            has_fk_relations,
        })
    }
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
