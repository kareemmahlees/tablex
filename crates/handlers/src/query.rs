use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;
use sqlx::{
    mysql::{MySqlQueryResult, MySqlRow},
    postgres::{PgQueryResult, PgRow},
    sqlite::{SqliteQueryResult, SqliteRow},
    Column, Row, Value, ValueRef,
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
            let value_ref = value.try_get_raw(i).unwrap();
            let v = ValueRef::to_owned(&value_ref);

            if v.is_null() {
                row_data.insert(column.name().to_string(), JsonValue::Null);
                continue;
            }

            let decoded = match v.type_info().to_string().as_str() {
                "CHAR" | "VARCHAR" | "TINYTEXT" | "TEXT" | "MEDIUMTEXT" | "LONGTEXT" | "ENUM"
                | "DATE" | "TIME" | "DATETIME" | "TIMESTAMP" | "JSON" => {
                    JsonValue::String(v.decode())
                }
                "FLOAT" => JsonValue::from(v.decode::<f32>()),
                "DOUBLE" => JsonValue::from(v.decode::<f64>()),
                "TINYINT" | "SMALLINT" | "INT" | "MEDIUMINT" | "BIGINT" => {
                    JsonValue::Number(v.decode::<i64>().into())
                }
                "TINYINT UNSIGNED" | "SMALLINT UNSIGNED" | "INT UNSIGNED"
                | "MEDIUMINT UNSIGNED" | "BIGINT UNSIGNED" | "YEAR" => {
                    JsonValue::Number(v.decode::<u64>().into())
                }
                "BOOLEAN" => JsonValue::Bool(v.decode::<bool>()),
                _ => JsonValue::Null,
            };

            row_data.insert(column.name().to_string(), decoded);
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
            let value_ref = value.try_get_raw(i).unwrap();
            let v = ValueRef::to_owned(&value_ref);

            if v.is_null() {
                row_data.insert(column.name().to_string(), JsonValue::Null);
                continue;
            }

            let decoded = match v.type_info().to_string().as_str() {
                "CHAR" | "VARCHAR" | "TEXT" | "NAME" | "UUID" | "TIME" | "TIMESTAMP"
                | "TIMESTAMPTZ" | "JSON" => JsonValue::String(v.decode::<String>()),
                "FLOAT4" => JsonValue::from(v.decode::<f32>()),
                "FLOAT8" => JsonValue::from(v.decode::<f64>()),
                "INT2" => JsonValue::Number(v.decode::<i16>().into()),
                "INT4" => JsonValue::Number(v.decode::<i32>().into()),
                "INT8" => JsonValue::Number(v.decode::<i64>().into()),
                "BOOL" => JsonValue::Bool(v.decode::<bool>()),
                "JSONB" | "BYTEA" | "VOID" => JsonValue::Null,
                _ => JsonValue::Null,
            };
            row_data.insert(column.name().to_string(), decoded);
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
            let value_ref = value.try_get_raw(i).unwrap();
            let v = ValueRef::to_owned(&value_ref);

            if v.is_null() {
                row_data.insert(column.name().to_string(), JsonValue::Null);
                continue;
            }

            let decoded = match v.type_info().to_string().as_str() {
                "TEXT" | "DATE" | "TIME" | "DATETIME" => JsonValue::String(v.decode()),
                "REAL" => JsonValue::from(v.decode::<f64>()),
                "INTEGER" | "NUMERIC" => JsonValue::Number(v.decode::<i64>().into()),
                "BOOLEAN" => JsonValue::Bool(v.decode::<bool>()),
                _ => JsonValue::Null,
            };

            row_data.insert(column.name().to_string(), decoded);
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
