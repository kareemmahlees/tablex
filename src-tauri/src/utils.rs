use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use sqlx::{any::AnyValueRef, TypeInfo, Value, ValueRef};
use std::fs::{create_dir_all, File, OpenOptions};
use std::io::{BufReader, BufWriter, Write};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub enum Drivers {
    SQLITE,
    PSQL,
    MYSQL,
}

#[derive(Serialize, Deserialize)]
pub struct ConnConfig {
    driver: Drivers,
    conn_string: String,
    conn_name: String,
}

pub fn write_into_connections_file(
    config_dir: Option<PathBuf>,
    driver: Drivers,
    conn_string: String,
    conn_name: String,
) {
    let (config_file_path, content) = read_from_connections_file(config_dir);

    let connection = ConnConfig {
        driver,
        conn_string,
        conn_name,
    };

    match content.unwrap().as_object_mut() {
        Some(v) => {
            let file = OpenOptions::new()
                .write(true)
                .open(config_file_path)
                .unwrap();
            let mut writer = BufWriter::new(file);

            let id = Uuid::new_v4().to_string();

            v.insert(id, serde_json::to_value(&connection).unwrap());
            serde_json::to_writer(&mut writer, &v).unwrap();
            writer.flush().unwrap();
        }
        None => todo!(),
    };
}

pub fn read_from_connections_file(
    config_dir: Option<PathBuf>,
) -> (PathBuf, serde_json::Result<serde_json::Value>) {
    match config_dir {
        Some(mut path) => {
            if !path.exists() {
                create_dir_all(&path).unwrap();
            }
            path.push("connections.json");
            let mut file: File;
            if !path.exists() {
                file = File::create(&path).unwrap();
                write!(file, "{{}}").unwrap()
            }
            file = OpenOptions::new().read(true).open(&path).unwrap();
            let reader = BufReader::new(file);

            let content: serde_json::Result<serde_json::Value> = serde_json::from_reader(reader);
            (path, content)
        }
        None => todo!(),
    }
}

// this code was taken from here https://github.com/tauri-apps/tauri-plugin-sql/blob/cf80d013a6ea34ee3ca74e4968a1632e87ba0de2/src/decode/sqlite.rs
// TODO refactor to include psql and mysql
pub fn to_json(v: AnyValueRef) -> Result<JsonValue, String> {
    if v.is_null() {
        return Ok(JsonValue::Null);
    }

    let res = match v.type_info().name() {
        "TEXT" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "REAL" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<f64>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "INTEGER" | "NUMERIC" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<i64>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        "BOOLEAN" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode() {
                JsonValue::Bool(v)
            } else {
                JsonValue::Null
            }
        }
        "DATE" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<String>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "TIME" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<String>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "DATETIME" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<String>() {
                JsonValue::String(v.to_string())
            } else {
                JsonValue::Null
            }
        }
        "BLOB" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<Vec<u8>>() {
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
