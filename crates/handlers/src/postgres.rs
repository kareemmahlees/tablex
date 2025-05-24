use crate::types::{ColumnInfo, CustomColumnType, Schema, TableInfo, TablesNames};
use sea_schema::postgres::def::Type as SeaColumnType;

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
            SeaColumnType::Interval(_) => todo!(),
            SeaColumnType::Boolean => CustomColumnType::Boolean,
            SeaColumnType::Point => todo!(),
            SeaColumnType::Line => todo!(),
            SeaColumnType::Lseg => todo!(),
            SeaColumnType::Box => todo!(),
            SeaColumnType::Path => todo!(),
            SeaColumnType::Polygon => todo!(),
            SeaColumnType::Circle => todo!(),
            SeaColumnType::Cidr => todo!(),
            SeaColumnType::Inet => todo!(),
            SeaColumnType::MacAddr => todo!(),
            SeaColumnType::MacAddr8 => todo!(),
            SeaColumnType::JsonBinary
            | SeaColumnType::Bytea
            | SeaColumnType::Bit(_)
            | SeaColumnType::VarBit(_) => todo!(),
            SeaColumnType::TsVector => todo!(),
            SeaColumnType::TsQuery => todo!(),
            SeaColumnType::Uuid => CustomColumnType::Uuid,
            SeaColumnType::Xml => todo!(),
            SeaColumnType::Json => CustomColumnType::Json,
            SeaColumnType::Array(_) => todo!(),
            SeaColumnType::Int4Range => todo!(),
            SeaColumnType::Int8Range => todo!(),
            SeaColumnType::NumRange => todo!(),
            SeaColumnType::TsRange => todo!(),
            SeaColumnType::TsTzRange => todo!(),
            SeaColumnType::DateRange => todo!(),
            SeaColumnType::PgLsn => todo!(),
            SeaColumnType::Unknown(_) => todo!(),
            SeaColumnType::Enum(_) => todo!(),
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
