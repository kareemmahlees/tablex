use crate::types::{ConnConfig, Drivers};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;
use uuid::Uuid;

/// Create a new connection record in `connections.json`.
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

    let file = OpenOptions::new()
        .write(true)
        .open(connections_file_path)
        .map_err(|e| e.to_string())?;
    let mut writer = BufWriter::new(file);

    let id = Uuid::new_v4().to_string();

    contents.insert(id, connection);
    serde_json::to_writer(&mut writer, &contents)
        .map_err(|_| "Failed to write connection record".to_string())?;
    writer.flush().unwrap();
    Ok(())
}

/// Delete connection record from `connections.json`.
pub fn delete_from_connections_file(
    connections_file_path: &mut PathBuf,
    conn_id: String,
) -> Result<(), String> {
    let mut contents = read_from_connections_file(connections_file_path)?;

    let file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(connections_file_path)
        .map_err(|e| e.to_string())?;
    let mut writer = BufWriter::new(file);

    contents
        .remove(&conn_id)
        .ok_or("Couldn't delete specified connection".to_string())?;
    serde_json::to_writer(&mut writer, &contents)
        .map_err(|_| "Failed to delete connection record".to_string())?;
    writer.flush().unwrap();
    Ok(())
}

/// Get all connections from `connections.json`.
pub fn read_from_connections_file(
    connections_file_path: &PathBuf,
) -> Result<HashMap<String, ConnConfig>, String> {
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
    let content: HashMap<String, ConnConfig> =
        serde_json::from_reader(reader).map_err(|e| e.to_string())?;
    Ok(content)
}
