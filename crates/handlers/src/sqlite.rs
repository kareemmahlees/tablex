use crate::types::{ColumnInfo, CustomColumnType, Schema, TableInfo};
use sea_schema::sea_query::ColumnType as SeaColumnType;

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
                    name: c.name.clone(),
                    nullable: !c.not_null,
                    pk: c.primary_key,
                    r#type: c.r#type.clone().into(),
                })
                .collect(),
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
