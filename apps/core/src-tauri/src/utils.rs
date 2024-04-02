use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;
use std::{collections::HashMap, fs::OpenOptions};
use tauri::Runtime;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(rename_all = "lowercase")]
pub enum Drivers {
    #[default]
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

pub fn get_connections_file_path<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut config_dir = app
        .path_resolver()
        .app_config_dir()
        .ok_or("Couldn't read config dir path".to_string())?;
    config_dir.push("connections.json");
    Ok(config_dir)
}

pub fn write_into_connections_file(
    connections_file_path: &mut PathBuf,
    driver: Drivers,
    conn_string: String,
    conn_name: String,
) -> Result<(), String> {
    let mut contents = read_from_connections_file(connections_file_path)?;

    let connection = ConnConfig {
        driver,
        conn_string,
        conn_name,
    };

    match contents.as_object_mut() {
        Some(v) => {
            let file = OpenOptions::new()
                .write(true)
                .open(connections_file_path)
                .map_err(|e| e.to_string())?;
            let mut writer = BufWriter::new(file);

            let id = Uuid::new_v4().to_string();

            v.insert(id, serde_json::to_value(connection).unwrap());
            serde_json::to_writer(&mut writer, &v)
                .map_err(|_| "Failed to write connection record".to_string())?;
            writer.flush().unwrap();
            Ok(())
        }
        None => Err("Invalid JSON file format".to_string()),
    }
}

pub fn delete_from_connections_file(
    connections_file_path: &mut PathBuf,
    conn_id: String,
) -> Result<(), String> {
    let mut contents = read_from_connections_file(connections_file_path)
        .map_err(|_| "Couldn't read contents of connections file")?;

    match contents.as_object_mut() {
        Some(v) => {
            let file = OpenOptions::new()
                .write(true)
                .truncate(true)
                .open(connections_file_path)
                .map_err(|e| e.to_string())?;
            let mut writer = BufWriter::new(file);

            v.remove(&conn_id)
                .ok_or("Couldn't delete specified connection".to_string())?;
            serde_json::to_writer(&mut writer, &v)
                .map_err(|_| "Failed to delete connection record".to_string())?;
            writer.flush().unwrap();
            Ok(())
        }
        None => Err("Invalid JSON file format".to_string()),
    }
}

pub fn read_from_connections_file(
    connections_file_path: &PathBuf,
) -> Result<serde_json::Value, String> {
    let prefix = connections_file_path.parent().unwrap();
    std::fs::create_dir_all(prefix)
        .map_err(|_| "Couldn't create config directory for TableX".to_string())?;

    let mut file = OpenOptions::new()
        .read(true)
        .create(true)
        .write(true)
        .open(connections_file_path)
        .map_err(|_| "connections.json file is not found")?;

    if file.metadata().unwrap().len() == 0 {
        write!(file, "{{}}")
            .map_err(|_| "Couldn't write initial content into connections file".to_string())?;
    }

    let _ = file.seek(SeekFrom::Start(0));
    let reader = BufReader::new(file);
    let content: serde_json::Result<serde_json::Value> = serde_json::from_reader(reader);
    content.map_err(|e| e.to_string())
}

/// shared between drivers::$::table.rs
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
