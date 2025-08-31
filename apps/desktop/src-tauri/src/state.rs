#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::DatabaseConnection;

#[derive(Default)]
pub struct SharedState {
    pub conn: Option<DatabaseConnection>,
    #[cfg(feature = "metax")]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    // pub fn new(
    //     conn: Option<DatabaseConnection>,
    //     #[cfg(feature = "metax")] metax: Option<CommandChild>,
    // ) -> Self {
    //     Self {
    //         conn,
    //         #[cfg(feature = "metax")]
    //         metax,
    //     }
    // }

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
