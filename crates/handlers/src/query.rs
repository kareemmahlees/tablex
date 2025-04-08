use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;
use sqlx::{
    mysql::{MySqlQueryResult, MySqlRow},
    postgres::{PgQueryResult, PgRow},
    sqlite::{SqliteQueryResult, SqliteRow},
    Column, Row,
};

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
pub struct DecodedRow(JsonMap<String, JsonValue>);

impl From<MySqlRow> for QueryResult {
    fn from(row: MySqlRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxMySql(row),
        }
    }
}

impl From<MySqlRow> for DecodedRow {
    fn from(value: MySqlRow) -> Self {
        let mut row_data = JsonMap::default();
        for (i, column) in value.columns().iter().enumerate() {
            let v = value.get(i);

            row_data.insert(column.name().to_string(), v);
        }
        DecodedRow(row_data)
    }
}

impl From<PgRow> for QueryResult {
    fn from(row: PgRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxPostgres(row),
        }
    }
}

impl From<PgRow> for DecodedRow {
    fn from(value: PgRow) -> Self {
        let mut row_data = JsonMap::default();
        for (i, column) in value.columns().iter().enumerate() {
            let v = value.get(i);

            row_data.insert(column.name().to_string(), v);
        }
        DecodedRow(row_data)
    }
}

impl From<SqliteRow> for QueryResult {
    fn from(row: SqliteRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxSqlite(row),
        }
    }
}

impl From<SqliteRow> for DecodedRow {
    fn from(value: SqliteRow) -> Self {
        let mut row_data = JsonMap::default();
        for (i, column) in value.columns().iter().enumerate() {
            let v = value.get(i);

            row_data.insert(column.name().to_string(), v);
        }
        DecodedRow(row_data)
    }
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct ExecResult {
    rows_affected: u64,
}

impl From<SqliteQueryResult> for ExecResult {
    fn from(value: SqliteQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}

impl From<PgQueryResult> for ExecResult {
    fn from(value: PgQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}

impl From<MySqlQueryResult> for ExecResult {
    fn from(value: MySqlQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}
