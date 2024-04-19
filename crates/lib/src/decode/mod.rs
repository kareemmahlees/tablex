use chrono::{NaiveDate, NaiveDateTime, NaiveTime};
use serde_json::Value as JsonValue;
use sqlx::{any::AnyValueRef, Any, TypeInfo, Value, ValueRef};

// this code was taken from here
// https://github.com/tauri-apps/tauri-plugin-sql/blob/v1/src/decode/sqlite.rs
pub fn to_json(v: AnyValueRef) -> Result<JsonValue, String> {
    if v.is_null() {
        return Ok(JsonValue::Null);
    }

    let res = match v.type_info().name() {
        "CHAR" | "VARCHAR" | "TINYTEXT" | "TEXT" | "MEDIUMTEXT" | "LONGTEXT" | "ENUM" | "NAME" => {
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
        "NULL" | "VOID" => JsonValue::Null,
        _ => return Err("Unsupported Data type".to_string()),
    };

    Ok(res)
}
