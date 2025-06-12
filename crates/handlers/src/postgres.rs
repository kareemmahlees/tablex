use crate::{
    db_schema::{ColumnInfo, CustomColumnType, Schema, TableInfo, TablesNames},
    query::{DecodedRow, ExecResult, QueryResult, QueryResultRow},
};
use sea_schema::postgres::def::Type as SeaColumnType;
use serde_json::{Map as JsonMap, Value as JsonValue};
use sqlx::{
    postgres::{PgQueryResult, PgRow},
    types::chrono::{NaiveDate, NaiveDateTime, NaiveTime},
    Column, Row, Value, ValueRef,
};

#[derive(Debug)]
pub struct PostgresHandler;

impl PostgresHandler {
    pub fn new() -> Box<Self> {
        Box::new(PostgresHandler {})
    }
}

impl From<sea_schema::postgres::def::Schema> for Schema {
    fn from(value: sea_schema::postgres::def::Schema) -> Self {
        Self {
            tables: value.tables.iter().map(|t| t.into()).collect(),
        }
    }
}

impl From<&sea_schema::postgres::def::TableDef> for TableInfo {
    #[allow(clippy::incompatible_msrv)]
    fn from(value: &sea_schema::postgres::def::TableDef) -> Self {
        Self {
            name: value.info.name.clone(),
            columns: value
                .columns
                .iter()
                .map(|c| ColumnInfo {
                    auto_generated: c.generated.is_some()
                        || c.default
                            .as_ref()
                            .is_some_and(|exp| exp.0.starts_with("nextval")),
                    name: c.name.clone(),
                    nullable: c.not_null.is_none(),
                    pk: c.is_identity,
                    r#type: c.col_type.clone().into(),
                })
                .collect(),
        }
    }
}

impl From<SeaColumnType> for CustomColumnType {
    fn from(value: SeaColumnType) -> Self {
        match value {
            SeaColumnType::SmallInt
            | SeaColumnType::Integer
            | SeaColumnType::BigInt
            | SeaColumnType::Numeric(_)
            | SeaColumnType::SmallSerial
            | SeaColumnType::Serial
            | SeaColumnType::BigSerial
            | SeaColumnType::Money => CustomColumnType::Integer,
            SeaColumnType::Decimal(_) | SeaColumnType::Real | SeaColumnType::DoublePrecision => {
                CustomColumnType::Float
            }
            SeaColumnType::Varchar(_) | SeaColumnType::Char(_) => CustomColumnType::String,
            SeaColumnType::Text => CustomColumnType::Text,
            SeaColumnType::Timestamp(_) | SeaColumnType::TimestampWithTimeZone(_) => {
                CustomColumnType::DateTime
            }
            SeaColumnType::Date => CustomColumnType::Date,
            SeaColumnType::Time(_) | SeaColumnType::TimeWithTimeZone(_) => CustomColumnType::Time,
            SeaColumnType::Interval(_) => CustomColumnType::UnSupported,
            SeaColumnType::Boolean => CustomColumnType::Boolean,
            SeaColumnType::Point => CustomColumnType::UnSupported,
            SeaColumnType::Line => CustomColumnType::UnSupported,
            SeaColumnType::Lseg => CustomColumnType::UnSupported,
            SeaColumnType::Box => CustomColumnType::UnSupported,
            SeaColumnType::Path => CustomColumnType::UnSupported,
            SeaColumnType::Polygon => CustomColumnType::UnSupported,
            SeaColumnType::Circle => CustomColumnType::UnSupported,
            SeaColumnType::Cidr => CustomColumnType::UnSupported,
            SeaColumnType::Inet => CustomColumnType::UnSupported,
            SeaColumnType::MacAddr => CustomColumnType::UnSupported,
            SeaColumnType::MacAddr8 => CustomColumnType::UnSupported,
            SeaColumnType::Bytea | SeaColumnType::Bit(_) | SeaColumnType::VarBit(_) => {
                CustomColumnType::Binary
            }
            SeaColumnType::TsVector => CustomColumnType::UnSupported,
            SeaColumnType::TsQuery => CustomColumnType::UnSupported,
            SeaColumnType::Uuid => CustomColumnType::Uuid,
            SeaColumnType::Xml => CustomColumnType::UnSupported,
            SeaColumnType::Json | SeaColumnType::JsonBinary => CustomColumnType::Json,
            SeaColumnType::Array(_) => CustomColumnType::UnSupported,
            SeaColumnType::Int4Range => CustomColumnType::UnSupported,
            SeaColumnType::Int8Range => CustomColumnType::UnSupported,
            SeaColumnType::NumRange => CustomColumnType::UnSupported,
            SeaColumnType::TsRange => CustomColumnType::UnSupported,
            SeaColumnType::TsTzRange => CustomColumnType::UnSupported,
            SeaColumnType::DateRange => CustomColumnType::UnSupported,
            SeaColumnType::PgLsn => CustomColumnType::UnSupported,
            SeaColumnType::Unknown(_) => CustomColumnType::UnSupported,
            SeaColumnType::Enum(_) => CustomColumnType::UnSupported,
        }
    }
}

impl From<Vec<sea_schema::postgres::def::TableInfo>> for TablesNames {
    fn from(value: Vec<sea_schema::postgres::def::TableInfo>) -> Self {
        let table_names = value
            .iter()
            .map(|t| t.name.clone())
            .collect::<Vec<String>>();
        TablesNames(table_names)
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
                "CHAR" | "VARCHAR" | "TEXT" | "NAME" | "UUID" => {
                    JsonValue::String(v.decode::<String>())
                }
                // "UUID"=>JsonValue::String(v.decode::<uuid>())
                "DATE" => JsonValue::String(v.decode::<NaiveDate>().to_string()),
                "TIME" => JsonValue::String(v.decode::<NaiveTime>().to_string()),
                "TIMESTAMP" | "TIMESTAMPTZ" => {
                    JsonValue::String(v.decode::<NaiveDateTime>().to_string())
                }
                "JSON" | "JSONB" => v.decode(),
                "FLOAT4" => JsonValue::from(v.decode::<f32>()),
                "FLOAT8" => JsonValue::from(v.decode::<f64>()),
                "INT2" => JsonValue::Number(v.decode::<i16>().into()),
                "INT4" => JsonValue::Number(v.decode::<i32>().into()),
                "INT8" => JsonValue::Number(v.decode::<i64>().into()),
                "BOOL" => JsonValue::Bool(v.decode::<bool>()),
                "BYTEA" => JsonValue::Array(
                    v.decode::<Vec<u8>>()
                        .into_iter()
                        .map(|n| JsonValue::Number(n.into()))
                        .collect(),
                ),
                "VOID" => JsonValue::Null,
                _ => JsonValue::Null,
            };
            row_data.insert(column.name().to_string(), decoded);
        }
        DecodedRow(row_data)
    }
}

impl From<PgQueryResult> for ExecResult {
    fn from(value: PgQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}
