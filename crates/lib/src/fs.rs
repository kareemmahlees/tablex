use crate::{ConnConfig, Drivers};
use std::fs::OpenOptions;
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;
use tauri::Runtime;
use uuid::Uuid;

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
    let mut contents = read_from_connections_file(connections_file_path)?;

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