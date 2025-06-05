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
pub struct DecodedRow(pub(crate) JsonMap<String, JsonValue>);

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct ExecResult {
    pub(crate) rows_affected: u64,
}
