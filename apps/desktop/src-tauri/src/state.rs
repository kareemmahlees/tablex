use serde::{Deserialize, Serialize};
use specta::Type;
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::DatabaseConnection;
use tx_lib::TxError;

#[derive(Default)]
pub struct SharedState {
    pub conn: Option<DatabaseConnection>,
    #[cfg(feature = "metax")]
    pub metax: MetaXState,
}

impl SharedState {
    pub fn cleanup(&mut self) {
        log::debug!("Connection pool closed.");

        #[cfg(feature = "metax")]
        self.metax.kill();
    }
}

#[derive(Default, Clone, Type, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MetaXStatus {
    Active,
    #[default]
    Exited,
    Paused,
}

#[derive(Default)]
#[cfg(feature = "metax")]
pub struct MetaXState {
    pub command_child: Option<CommandChild>,
    pub status: MetaXStatus,
}

#[cfg(feature = "metax")]
impl MetaXState {
    pub fn new(command_child: Option<CommandChild>, status: MetaXStatus) -> Self {
        Self {
            command_child,
            status,
        }
    }

    pub fn kill(&mut self) -> Result<(), TxError> {
        if let Some(command) = self.command_child.take() {
            command
                .kill()
                .map_err(|_| TxError::MetaXError("Failed to kill metax".to_string()))?;
            log::debug!("MetaX shutdown.");
        };

        Ok(())
    }
}
