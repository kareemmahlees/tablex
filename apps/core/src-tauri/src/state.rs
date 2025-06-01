#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::DatabaseConnection;

pub struct SharedState {
    pub conn: DatabaseConnection,
    /// `pool` is passed to the Handler
    #[cfg(feature = "metax")]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    pub fn new(
        conn: DatabaseConnection,
        #[cfg(feature = "metax")] metax: Option<CommandChild>,
    ) -> Self {
        Self {
            conn,
            #[cfg(feature = "metax")]
            metax,
        }
    }

    pub async fn cleanup(&mut self) {
        log::debug!("Connection pool closed.");

        #[cfg(feature = "metax")]
        {
            if let Some(metax) = self.metax.take() {
                metax.kill().expect("unable to kill sidecar");
                log::debug!("MetaX shutdown.");
            }
        }
    }
}
