use crate::types::{ColumnInfo, CustomColumnType, Schema, TableInfo, TablesNames};
use sea_schema::mysql::def::{TableDef, Type as SeaColumnType};

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
                    name: c.name.clone(),
                    nullable: c.null,
                    pk: false,
                    r#type: c.col_type.clone().into(),
                })
                .collect(),
        }
    }
}

impl From<SeaColumnType> for CustomColumnType {
    fn from(value: SeaColumnType) -> Self {
        match value {
            SeaColumnType::Serial => todo!(),
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
            SeaColumnType::DateTime(_) => CustomColumnType::DateTime,
            SeaColumnType::Timestamp(time_attr) => todo!(),
            SeaColumnType::Year => CustomColumnType::Year,
            SeaColumnType::Char(_)
            | SeaColumnType::NChar(_)
            | SeaColumnType::Varchar(_)
            | SeaColumnType::NVarchar(_) => CustomColumnType::String,
            SeaColumnType::Binary(string_attr) => todo!(),
            SeaColumnType::Varbinary(string_attr) => todo!(),
            SeaColumnType::Text(string_attr)
            | SeaColumnType::TinyText(string_attr)
            | SeaColumnType::MediumText(string_attr)
            | SeaColumnType::LongText(string_attr) => CustomColumnType::Text,
            SeaColumnType::Bit(_) | SeaColumnType::Blob(_) => CustomColumnType::Binary,
            SeaColumnType::TinyBlob | SeaColumnType::MediumBlob | SeaColumnType::LongBlob => {
                CustomColumnType::Binary
            }
            SeaColumnType::Enum(enum_def) => todo!(),
            SeaColumnType::Set(set_def) => todo!(),
            SeaColumnType::Geometry(geometry_attr) => todo!(),
            SeaColumnType::Point(geometry_attr) => todo!(),
            SeaColumnType::LineString(geometry_attr) => todo!(),
            SeaColumnType::Polygon(geometry_attr) => todo!(),
            SeaColumnType::MultiPoint(geometry_attr) => todo!(),
            SeaColumnType::MultiLineString(geometry_attr) => todo!(),
            SeaColumnType::MultiPolygon(geometry_attr) => todo!(),
            SeaColumnType::GeometryCollection(geometry_attr) => todo!(),
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
