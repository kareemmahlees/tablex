use crate::{
    DecodedRow, ExecResult, QueryResult, QueryResultRow,
    schema::{ColumnInfo, CustomColumnType, Schema, TableInfo, TablesNames},
};
use sea_query::SqliteQueryBuilder;
use sea_schema::{sea_query::ColumnType as SeaColumnType, sqlite::def::TableDef};
use serde_json::{Map as JsonMap, Value as JsonValue};
use sqlx::{
    Column, Row, Value, ValueRef,
    sqlite::{SqliteQueryResult, SqliteRow},
};

#[derive(Debug)]
pub struct SQLiteHandler;

impl SQLiteHandler {
    pub fn new() -> Box<Self> {
        Box::new(SQLiteHandler {})
    }
}

impl From<sea_schema::sqlite::def::Schema> for Schema {
    fn from(value: sea_schema::sqlite::def::Schema) -> Self {
        Self {
            tables: value.tables.iter().map(|t| t.into()).collect(),
        }
    }
}

impl From<&sea_schema::sqlite::def::TableDef> for TableInfo {
    fn from(value: &sea_schema::sqlite::def::TableDef) -> Self {
        Self {
            name: value.name.clone(),
            columns: value
                .columns
                .iter()
                .map(|c| ColumnInfo {
                    auto_generated: c.primary_key && value.auto_increment,
                    name: c.name.clone(),
                    nullable: !c.not_null,
                    pk: c.primary_key,
                    r#type: c.r#type.clone().into(),
                })
                .collect(),
            create_statement:value.write().to_string(SqliteQueryBuilder)
        }
    }
}

impl From<SeaColumnType> for CustomColumnType {
    fn from(value: SeaColumnType) -> Self {
        match value {
            SeaColumnType::Char(_) | SeaColumnType::String(_) => CustomColumnType::String,
            SeaColumnType::Text => CustomColumnType::Text,
            SeaColumnType::Blob
            | SeaColumnType::JsonBinary
            | SeaColumnType::VarBit(_)
            | SeaColumnType::Bit(_)
            | SeaColumnType::VarBinary(_)
            | SeaColumnType::Binary(_) => CustomColumnType::Binary,
            SeaColumnType::TinyInteger
            | SeaColumnType::SmallInteger
            | SeaColumnType::Integer
            | SeaColumnType::Money(_)
            | SeaColumnType::BigInteger => CustomColumnType::Integer,
            SeaColumnType::TinyUnsigned
            | SeaColumnType::SmallUnsigned
            | SeaColumnType::Unsigned
            | SeaColumnType::BigUnsigned => CustomColumnType::PositiveInteger,
            SeaColumnType::Float | SeaColumnType::Double | SeaColumnType::Decimal(_) => {
                CustomColumnType::Float
            }
            SeaColumnType::DateTime
            | SeaColumnType::Timestamp
            | SeaColumnType::TimestampWithTimeZone => CustomColumnType::DateTime,
            SeaColumnType::Time => CustomColumnType::Time,
            SeaColumnType::Date => CustomColumnType::Date,
            SeaColumnType::Year => CustomColumnType::Year,
            SeaColumnType::Boolean => CustomColumnType::Boolean,
            SeaColumnType::Json => CustomColumnType::Json,
            SeaColumnType::Uuid => CustomColumnType::Uuid,
            SeaColumnType::Custom(_) => CustomColumnType::Custom,
            SeaColumnType::Enum {
                name: _,
                variants: _,
            } => todo!(),
            SeaColumnType::Array(_column_type) => todo!(),
            SeaColumnType::Vector(_) => todo!(),
            SeaColumnType::Cidr => todo!(),
            SeaColumnType::Inet => todo!(),
            SeaColumnType::MacAddr => todo!(),
            SeaColumnType::LTree => todo!(),
            _ => todo!(),
        }
    }
}

impl From<Vec<TableDef>> for TablesNames {
    fn from(value: Vec<TableDef>) -> Self {
        let table_names = value
            .iter()
            .map(|t| t.name.clone())
            .collect::<Vec<String>>();
        TablesNames(table_names)
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

impl From<SqliteQueryResult> for ExecResult {
    fn from(value: SqliteQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}
