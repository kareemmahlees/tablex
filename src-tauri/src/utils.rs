use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::io::{BufReader, BufWriter, Write};
use std::path::PathBuf;
use std::{
    collections::HashMap,
    fs::{create_dir_all, File, OpenOptions},
};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Drivers {
    SQLite,
    PostgreSQL,
    MySQL,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConnConfig {
    driver: Drivers,
    #[serde(rename = "connString")]
    conn_string: String,
    #[serde(rename = "connName")]
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

            v.insert(id, serde_json::to_value(connection).unwrap());
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

pub fn create_column_definition_map(
    data_type: JsonValue,
    is_nullable: JsonValue,
    default_value: JsonValue,
    is_pk: JsonValue,
) -> HashMap<String, JsonValue> {
    let mut map = HashMap::<String, JsonValue>::new();
    map.insert("type".to_string(), data_type);
    map.insert("isNullable".to_string(), is_nullable);
    map.insert("defaultValue".to_string(), default_value);
    map.insert("isPK".to_string(), is_pk);
    map
}
