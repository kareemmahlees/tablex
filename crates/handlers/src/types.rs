use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::{mysql::MySqlRow, postgres::PgRow, sqlite::SqliteRow, Row};

pub struct Schema {
    pub tables: Vec<TableInfo>,
}

pub struct TableInfo {
    pub name: String,
    pub columns: Vec<ColumnInfo>,
}

#[derive(Serialize, Deserialize, Type, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ColumnInfo {
    pub name: String,
    pub nullable: bool,
    pub pk: bool,
    pub r#type: CustomColumnType,
}

#[derive(Serialize, Deserialize, Default, Clone, Copy, Type)]
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

pub struct QueryResult {
    pub row: QueryResultRow,
}

impl From<MySqlRow> for QueryResult {
    fn from(row: MySqlRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxMySql(row),
        }
    }
}
impl From<PgRow> for QueryResult {
    fn from(row: PgRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxPostgres(row),
        }
    }
}
impl From<SqliteRow> for QueryResult {
    fn from(row: SqliteRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxSqlite(row),
        }
    }
}

#[allow(clippy::enum_variant_names)]
pub(crate) enum QueryResultRow {
    SqlxMySql(MySqlRow),
    SqlxPostgres(PgRow),
    SqlxSqlite(SqliteRow),
}
