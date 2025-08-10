use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;
use sqlx::{mysql::MySqlRow, postgres::PgRow, sqlite::SqliteRow};

pub struct QueryResult {
    pub row: QueryResultRow,
}

#[allow(clippy::enum_variant_names)]
pub enum QueryResultRow {
    SqlxMySql(MySqlRow),
    SqlxPostgres(PgRow),
    SqlxSqlite(SqliteRow),
}

#[derive(Debug, Serialize, Deserialize, Type)]
/// Represents the transformation result of a series of database `ValueRef`
/// into a `JsonMap` that can be understood and serialized by the frontend.
///
/// Result is a map whose key is the column name and value is the column value in the row.
pub struct DecodedRow(pub(crate) JsonMap<String, JsonValue>);

#[derive(Debug, Serialize, Deserialize, Type, Default)]
pub struct ExecResult {
    pub(crate) rows_affected: u64,
}
