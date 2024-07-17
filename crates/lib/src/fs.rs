use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fs::{File, OpenOptions};
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;

/// Write into _any_ json file (e.g `connections.json`, `keybindings.json`).
pub fn write_into_json<S>(path: &PathBuf, contents: S) -> Result<(), String>
where
    S: Serialize,
{
    let file = OpenOptions::new()
        .write(true)
        .truncate(true)
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
    let mut file = create_json_file_recursively(path)?;

    let _ = file.seek(SeekFrom::Start(0));
    let reader = BufReader::new(file);
    let content: D = serde_json::from_reader(reader).map_err(|e| e.to_string())?;
    Ok(content)
}

#[allow(clippy::incompatible_msrv)]
/// Creates an empty json file with all parent directories recursively if it doesn't exist and
/// write to it and empty object ( `{}` ),
/// otherwise opens the file and returns it.
pub fn create_json_file_recursively(path: &PathBuf) -> Result<File, String> {
    let file_name = path.file_name().unwrap().to_str().unwrap();
    if path.exists() {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(path)
            .map_err(|_| format!("Couldn't open {file_name}"))?;
        return Ok(file);
    }
    let parent = path.parent().unwrap();
    if !parent.exists() {
        std::fs::create_dir_all(parent)
            .map_err(|_| "Couldn't create config directory for TableX".to_string())?;
    }
    let mut file = File::create_new(path).map_err(|_| format!("Failed to create {file_name}"))?;

    write!(file, "{{}}").map_err(|_| format!("Couldn't write initial content into {file_name}"))?;
    Ok(file)
}
