use serde_json::Value as JsonValue;
use sqlx::{sqlite::SqliteValueRef, TypeInfo, Value, ValueRef};
use time::{Date, PrimitiveDateTime, Time};

// this code was taken from here
// https://github.com/tauri-apps/tauri-plugin-sql/blob/v1/src/decode/sqlite.rs
pub fn to_json(v: SqliteValueRef) -> Result<JsonValue, String> {
    if v.is_null() {
        return Ok(JsonValue::Null);
    }

    let res = match v.type_info().name() {
        "TEXT" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "REAL" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<f64>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "INTEGER" | "NUMERIC" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<i64>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        "BOOLEAN" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode() {
                JsonValue::Bool(v)
            } else {
                JsonValue::Null
            }
        }
        "DATE" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<Date>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "TIME" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<Time>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "DATETIME" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<PrimitiveDateTime>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "BLOB" => {
            if let Ok(v) = SqliteValueRef::to_owned(&v).try_decode::<Vec<u8>>() {
                JsonValue::Array(v.into_iter().map(|n| JsonValue::Number(n.into())).collect())
            } else {
                JsonValue::Null
            }
        }
        "NULL" => JsonValue::Null,
        _ => return Err("Unsupported Data type".to_string()),
    };

    Ok(res)
}
