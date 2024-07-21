use schemars::schema_for;
use std::{error::Error, fs::OpenOptions, path::PathBuf};
use tx_settings::Settings;

const SCHEMA_FILE_NAME: &str = "schema.json";

fn main() -> Result<(), Box<dyn Error>> {
    let mut file_path = std::env::var("CARGO_MANIFEST_DIR")?.parse::<PathBuf>()?;
    file_path.push(SCHEMA_FILE_NAME);

    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(file_path)?;

    let schema = schema_for!(Settings);
    serde_json::to_writer_pretty(file, &schema)?;
    Ok(())
}
