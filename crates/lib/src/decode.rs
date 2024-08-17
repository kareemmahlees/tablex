use crate::Result;
use chrono::{NaiveDate, NaiveDateTime, NaiveTime};
use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};
use specta::Type;
use sqlx::{
    any::{AnyRow, AnyValueRef},
    Column, Row, TypeInfo, Value, ValueRef,
};

#[derive(Serialize, Deserialize, Debug, Type, Default)]
#[serde(rename_all = "camelCase")]
/// Representation for database columns data types.
pub enum DataType {
    #[default]
    Text,
    Uuid,
    Float,
    PositiveInteger,
    Boolean,
    Integer,
    Date,
    DateTime,
    Time,
    Json,
    Unsupported,
    Null,
}

/// Utility to decode *most* of db types into serializable rust types.
/// this code was taken from [here] (https://github.com/tauri-apps/tauri-plugin-sql/blob/v1/src/decode)
pub fn to_json(v: AnyValueRef) -> Result<JsonValue> {
    if v.is_null() {
        return Ok(JsonValue::Null);
    }

    let res = match v.type_info().name() {
        "CHAR" | "VARCHAR" | "CHARACTER VARYING" | "TINYTEXT" | "TEXT" | "MEDIUMTEXT"
        | "LONGTEXT" | "ENUM" | "NAME" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "FLOAT4" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<f32>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "FLOAT8" | "REAL" | "DOUBLE" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<f64>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "INT2" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<i16>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        "INT4" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<i32>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        "INTEGER" | "NUMERIC" | "INT8" | "TINYINT" | "SMALLINT" | "INT" | "MEDIUMINT"
        | "BIGINT" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<i64>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        // TODO the current sqlx version doesn't implement the `Decode` trait for usize rust types.
        // "TINYINT UNSIGNED" | "SMALLINT UNSIGNED" | "INT UNSIGNED" | "MEDIUMINT UNSIGNED"
        // | "BIGINT UNSIGNED" | "YEAR" => {
        //     if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<u32>() {
        //         JsonValue::Number(v.into())
        //     } else {
        //         JsonValue::Null
        //     }
        // }
        "BOOLEAN" | "BOOL" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode() {
                JsonValue::Bool(v)
            } else {
                JsonValue::Null
            }
        }
        "DATE" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<NaiveDate>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "TIME" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<NaiveTime>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "DATETIME" | "TIMESTAMP" | "TIMESTAMPTZ" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<NaiveDateTime>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "TINIYBLOB" | "MEDIUMBLOB" | "BLOB" | "BYTEA" | "LONGBLOB" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode::<Vec<u8>>() {
                JsonValue::Array(v.into_iter().map(|n| JsonValue::Number(n.into())).collect())
            } else {
                JsonValue::Null
            }
        }
        "JSON" | "JSONB" => {
            if let Ok(v) = AnyValueRef::to_owned(&v).try_decode_unchecked::<String>() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "NULL" | "VOID" => JsonValue::Null,
        _ => return Err(crate::TxError::UnsupportedDataType),
    };

    Ok(res)
}

/// Transforms database data types into rust friendly data types that can be
/// consumed by the fronted.
pub fn to_data_type(v: AnyValueRef) -> DataType {
    if v.is_null() {
        return DataType::Null;
    }

    let value = AnyValueRef::to_owned(&v);
    let column_type = value.decode::<&str>();

    match column_type.to_uppercase().as_str() {
        "\"CHAR\"" | "VARCHAR" | "CHARACTER VARYING" | "TINYTEXT" | "TEXT" | "MEDIUMTEXT"
        | "LONGTEXT" | "ENUM" | "NAME" => DataType::Text,

        "UUID" => DataType::Uuid,

        "FLOAT4" | "FLOAT8" | "REAL" | "DOUBLE" => DataType::Float,

        "INT2" | "INT4" | "INTEGER" | "NUMERIC" | "INT8" | "TINYINT" | "SMALLINT" | "INT"
        | "MEDIUMINT" | "YEAR" => DataType::PositiveInteger,

        "TINYINT UNSIGNED" | "SMALLINT UNSIGNED" | "INT UNSIGNED" | "MEDIUMINT UNSIGNED"
        | "BIGINT UNSIGNED" => DataType::Integer,

        "BOOLEAN" | "BOOL" => DataType::Boolean,

        "DATE" => DataType::Date,

        "TIME" | "TIME WITHOUT TIME ZONE" => DataType::Time,

        "DATETIME" | "TIMESTAMP" | "TIMESTAMPTZ" | "TIMESTAMP WITHOUT TIME ZONE" => {
            DataType::DateTime
        }

        "JSON" | "JSONB" => DataType::Json,

        "TINIYBLOB" | "MEDIUMBLOB" | "BLOB" | "BYTEA" | "LONGBLOB" => DataType::Unsupported,

        "NULL" | "VOID" => DataType::Null,
        _ => DataType::Unsupported,
    }
}

/// Transform/Decode a `Vec<AnyRow>` into a serializable datastructure.
///
/// Typically used with `SELECT *`.
pub fn decode_raw_rows(rows: Vec<AnyRow>) -> Result<Vec<JsonMap<String, JsonValue>>> {
    let mut result = Vec::new();

    for row in rows {
        let mut row_data = JsonMap::default();
        for (i, column) in row.columns().iter().enumerate() {
            let v = row.try_get_raw(i).unwrap();

            let v = to_json(v)?;

            row_data.insert(column.name().to_string(), v);
        }

        result.push(row_data);
    }
    Ok(result)
}
