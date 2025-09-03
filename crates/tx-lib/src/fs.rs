use serde::Serialize;
use serde::de::DeserializeOwned;
use std::fs::{File, OpenOptions};
use std::io::{BufReader, BufWriter, Seek, SeekFrom, Write};
use std::path::PathBuf;

use crate::TxError;

/// Write into _any_ json file (e.g `connections.json`, `keybindings.json`).
pub fn write_into_json<S>(path: &PathBuf, contents: S) -> Result<(), TxError>
where
    S: Serialize,
{
    let file = OpenOptions::new().write(true).truncate(true).open(path)?;
    let mut writer = BufWriter::new(file);

    serde_json::to_writer_pretty(&mut writer, &contents)?;
    writer.flush().unwrap();

    Ok(())
}

/// Read from _any_ json file (e.g `connections.json`, `keybindings.json`).
///
/// `D` represents the type to which the contents of the file will be deserialized into.
pub fn read_from_json<D>(path: &PathBuf) -> Result<D, TxError>
where
    D: DeserializeOwned,
{
    let mut file = if !path.exists() {
        create_json_file_recursively(path)?
    } else {
        OpenOptions::new().read(true).write(true).open(path)?
    };

    let _ = file.seek(SeekFrom::Start(0));
    let reader = BufReader::new(file);
    let content: D = serde_json::from_reader(reader)?;
    Ok(content)
}

#[allow(clippy::incompatible_msrv)]
/// Creates an empty json file with all parent directories recursively if it doesn't exist and
/// write to it and empty object ( `{}` ),
/// otherwise opens the file and returns it.
pub fn create_json_file_recursively(path: &PathBuf) -> Result<File, TxError> {
    let parent = path.parent().unwrap();
    if !parent.exists() {
        std::fs::create_dir_all(parent)?;
        log::info!("Created {} recursively.", parent.to_str().unwrap());
    }

    let mut file = File::create_new(path)?;
    log::info!("Created {}.", path.to_str().unwrap());

    write!(file, "{{}}")?;
    log::info!("Wrote initial content to {}.", path.to_str().unwrap());

    Ok(file)
}
