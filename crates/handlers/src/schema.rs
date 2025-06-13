use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use specta::Type;
use uuid::Uuid;

#[derive(Debug)]
pub struct Schema {
    pub tables: Vec<TableInfo>,
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct TableInfo {
    pub name: String,
    pub columns: Vec<ColumnInfo>,
}

#[derive(Serialize, Deserialize, Type, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ColumnInfo {
    pub auto_generated: bool,
    pub name: String,
    pub nullable: bool,
    pub pk: bool,
    pub r#type: CustomColumnType,
}

#[derive(Serialize, Deserialize)]
pub struct TablesNames(pub Vec<String>);

#[derive(Serialize, Deserialize, Default, Clone, Copy, Type, Debug)]
#[serde(rename_all = "camelCase")]
/// Acts as a unified interface for all databases' datatypes.
/// Each database implements the conversion of it's datatypes to the
/// corresponding `CustomColumnType`.
pub enum CustomColumnType {
    #[default]
    String,
    Text,
    Uuid,
    Float,
    PositiveInteger,
    Boolean,
    Integer,
    Date,
    DateTime,
    Time,
    Year,
    Json,
    Binary,
    Custom,
    UnSupported,
}

#[derive(Serialize, Deserialize, Type, Clone, Debug)]
#[serde(rename_all = "camelCase")]
/// Represents a cell info in a row. Used primarily for when performing
/// operations on rows (`Insert`, `Update`, `Delete`)
pub struct RowRecord {
    pub column_name: String,
    pub value: JsonValue,
    column_type: CustomColumnType,
}

impl From<RowRecord> for sea_query::Value {
    fn from(value: RowRecord) -> Self {
        match value.value {
            JsonValue::Null => match value.column_type {
                CustomColumnType::String | CustomColumnType::Text | CustomColumnType::Year => {
                    sea_query::Value::String(None)
                }
                CustomColumnType::Uuid => sea_query::Value::Uuid(None),
                CustomColumnType::Float => sea_query::Value::Double(None),
                CustomColumnType::PositiveInteger => sea_query::Value::BigInt(None),
                CustomColumnType::Boolean => sea_query::Value::Bool(None),
                CustomColumnType::Integer => sea_query::Value::BigUnsigned(None),
                CustomColumnType::Date => sea_query::Value::ChronoDate(None),
                CustomColumnType::DateTime => sea_query::Value::ChronoDateTime(None),
                CustomColumnType::Time => sea_query::Value::ChronoTime(None),
                CustomColumnType::Json => sea_query::Value::Json(None),
                CustomColumnType::Binary => sea_query::Value::Bytes(None),
                CustomColumnType::Custom => todo!(),
                CustomColumnType::UnSupported => todo!(),
            },
            JsonValue::Bool(v) => sea_query::Value::Bool(Some(v)),
            JsonValue::Number(number) => {
                if number.is_f64() {
                    sea_query::Value::Double(number.as_f64())
                } else if number.is_i64() {
                    sea_query::Value::BigInt(number.as_i64())
                } else if number.is_u64() {
                    sea_query::Value::BigUnsigned(number.as_u64())
                } else {
                    todo!()
                }
            }
            JsonValue::String(v) => match value.column_type {
                CustomColumnType::String | CustomColumnType::Text | CustomColumnType::Year => {
                    sea_query::Value::String(Some(Box::new(v)))
                }
                CustomColumnType::Uuid => {
                    sea_query::Value::Uuid(Some(Box::new(Uuid::parse_str(v.as_str()).unwrap())))
                }
                CustomColumnType::Date => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoDate(Some(Box::new(date.date_naive())))
                }
                CustomColumnType::DateTime => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoDateTime(Some(Box::new(date.naive_utc())))
                }
                CustomColumnType::Time => {
                    let date = v.parse::<DateTime<Utc>>().unwrap();
                    sea_query::Value::ChronoTime(Some(Box::new(date.time())))
                }
                _ => unimplemented!(),
            },
            JsonValue::Array(_) => todo!(),
            JsonValue::Object(map) => {
                sea_query::Value::Json(Some(Box::new(JsonValue::Object(map))))
            }
        }
    }
}
