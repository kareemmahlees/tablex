use crate::{
    DecodedRow, ExecResult, QueryResult, QueryResultRow,
    schema::{ColumnInfo, CustomColumnType, Schema, TableInfo, TablesNames},
};
use sea_query::MysqlQueryBuilder;
use sea_schema::mysql::def::{ColumnKey, Type as SeaColumnType};
use serde_json::{Map as JsonMap, Value as JsonValue};
use sqlx::{
    Column, Row, Value, ValueRef,
    mysql::{MySqlQueryResult, MySqlRow},
};

#[derive(Debug)]
pub struct MySQLHandler;

impl MySQLHandler {
    pub fn new() -> Box<Self> {
        Box::new(MySQLHandler {})
    }
}

impl From<sea_schema::mysql::def::Schema> for Schema {
    fn from(value: sea_schema::mysql::def::Schema) -> Self {
        Self {
            tables: value.tables.iter().map(|t| t.into()).collect(),
        }
    }
}

impl From<&sea_schema::mysql::def::TableDef> for TableInfo {
    fn from(value: &sea_schema::mysql::def::TableDef) -> Self {
        Self {
            name: value.info.name.clone(),
            columns: value
                .columns
                .iter()
                .map(|c| ColumnInfo {
                    auto_generated: c.expression.is_some(),
                    name: c.name.clone(),
                    nullable: c.null,
                    pk: c.key == ColumnKey::Primary,
                    r#type: c.col_type.clone().into(),
                })
                .collect(),
            create_statement: value.write().to_string(MysqlQueryBuilder),
        }
    }
}

impl From<SeaColumnType> for CustomColumnType {
    fn from(value: SeaColumnType) -> Self {
        match value {
            SeaColumnType::Bool => CustomColumnType::Boolean,
            SeaColumnType::TinyInt(_)
            | SeaColumnType::SmallInt(_)
            | SeaColumnType::MediumInt(_)
            | SeaColumnType::Int(_)
            | SeaColumnType::BigInt(_) => CustomColumnType::Integer,
            SeaColumnType::Decimal(_) | SeaColumnType::Float(_) | SeaColumnType::Double(_) => {
                CustomColumnType::Float
            }
            SeaColumnType::Date => CustomColumnType::Date,
            SeaColumnType::Time(_) => CustomColumnType::Time,
            SeaColumnType::DateTime(_) | SeaColumnType::Timestamp(_) => CustomColumnType::DateTime,
            SeaColumnType::Year => CustomColumnType::Year,
            SeaColumnType::Char(_)
            | SeaColumnType::NChar(_)
            | SeaColumnType::Varchar(_)
            | SeaColumnType::NVarchar(_)
            | SeaColumnType::Serial => CustomColumnType::String,
            SeaColumnType::Text(_)
            | SeaColumnType::TinyText(_)
            | SeaColumnType::MediumText(_)
            | SeaColumnType::LongText(_) => CustomColumnType::Text,
            SeaColumnType::Bit(_)
            | SeaColumnType::Blob(_)
            | SeaColumnType::Binary(_)
            | SeaColumnType::Varbinary(_)
            | SeaColumnType::TinyBlob
            | SeaColumnType::MediumBlob
            | SeaColumnType::LongBlob => CustomColumnType::Binary,
            SeaColumnType::Enum(_) => todo!(),
            SeaColumnType::Set(_) => todo!(),
            SeaColumnType::Geometry(_) => todo!(),
            SeaColumnType::Point(_) => todo!(),
            SeaColumnType::LineString(_) => todo!(),
            SeaColumnType::Polygon(_) => todo!(),
            SeaColumnType::MultiPoint(_) => todo!(),
            SeaColumnType::MultiLineString(_) => todo!(),
            SeaColumnType::MultiPolygon(_) => todo!(),
            SeaColumnType::GeometryCollection(_) => todo!(),
            SeaColumnType::Json => CustomColumnType::Json,
            SeaColumnType::Unknown(_) => todo!(),
        }
    }
}

impl From<Vec<sea_schema::mysql::def::TableInfo>> for TablesNames {
    fn from(value: Vec<sea_schema::mysql::def::TableInfo>) -> Self {
        let table_names = value
            .iter()
            .map(|t| t.name.clone())
            .collect::<Vec<String>>();
        TablesNames(table_names)
    }
}

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

impl From<MySqlQueryResult> for ExecResult {
    fn from(value: MySqlQueryResult) -> Self {
        Self {
            rows_affected: value.rows_affected(),
        }
    }
}
