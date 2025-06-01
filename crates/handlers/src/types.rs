use sea_schema::sea_query;
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::Row;

#[derive(Debug)]
pub struct Schema {
    pub tables: Vec<TableInfo>,
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct TableInfo {
    pub name: String,
    pub columns: Vec<ColumnInfo>,
}

#[derive(Serialize, Deserialize, Type, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ColumnInfo {
    pub auto_generated: bool,
    pub name: String,
    pub nullable: bool,
    pub pk: bool,
    pub r#type: CustomColumnType,
}

#[derive(Serialize, Deserialize, Default, Clone, Copy, Type, Debug)]
#[serde(rename_all = "camelCase")]
pub enum CustomColumnType {
    #[default]
    String,
    Text,
    Uuid,
    Float,
    PositiveInteger,
    Boolean,
    Integer,
    Date,
    DateTime,
    Time,
    Year,
    Json,
    Binary,
    Custom,
}

#[derive(Serialize, Deserialize)]
pub struct TablesNames(pub Vec<String>);
