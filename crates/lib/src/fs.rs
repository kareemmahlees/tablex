use crate::types::ConnectionsFileSchema;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fs::{File, OpenOptions};
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;

/// Delete connection record from `connections.json`.
pub fn delete_from_connections_file(
    connections_file_path: &mut PathBuf,
    conn_id: String,
) -> Result<(), String> {
    let mut contents = read_from_json::<ConnectionsFileSchema>(connections_file_path)?;

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

/// Write into _any_ json file (e.g `connections.json`, `keybindings.json`).
pub fn write_into_json<S>(path: &PathBuf, contents: S) -> Result<(), String>
where
    S: Serialize,
{
    let file = OpenOptions::new()
        .write(true)
        .open(path)
        .map_err(|e| e.to_string())?;
    let mut writer = BufWriter::new(file);

    serde_json::to_writer(&mut writer, &contents)
        .map_err(|_| "Failed to write connection record".to_string())?;
    writer.flush().unwrap();
    Ok(())
}

/// Read from _any_ json file (e.g `connections.json`, `keybindings.json`).
///
/// `D` represents the type to which the contents of the file will be deserialized into.
pub fn read_from_json<D>(path: &PathBuf) -> Result<D, String>
where
    D: DeserializeOwned,
{
    let mut file = open_or_create_file(path)?;

    let _ = file.seek(SeekFrom::Start(0));
    let reader = BufReader::new(file);
    let content: D = serde_json::from_reader(reader).map_err(|e| e.to_string())?;
    Ok(content)
}

#[allow(clippy::incompatible_msrv)]
/// Tries to open the specified path in `read` and `write` mode, if doesn't exist then will create
/// the file and it's parent directories _recursively_.
fn open_or_create_file(path: &PathBuf) -> Result<File, String> {
    let file_name = path.file_name().unwrap().to_str().unwrap();
    if !path.exists() {
        let parent = path.parent().unwrap();
        if !parent.exists() {
            std::fs::create_dir_all(parent)
                .map_err(|_| "Couldn't create config directory for TableX".to_string())?;
        }
        let mut file =
            File::create_new(path).map_err(|_| format!("Failed to create {file_name}"))?;

        if file.metadata().unwrap().len() == 0 {
            write!(file, "{{}}")
                .map_err(|_| format!("Couldn't write initial content into {file_name}"))?;
        }
        return Ok(file);
    };
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(path)
        .map_err(|_| format!("Couldn't open {file_name}"))?;
    Ok(file)
}
