use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    page_size: u32,
}

impl Settings {
    pub fn new(page_size: u32) -> Self {
        Self { page_size }
    }
}
