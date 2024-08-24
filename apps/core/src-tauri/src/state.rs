use sqlx::AnyPool;
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::Handler;

#[derive(Debug)]
pub struct SharedState {
    pub handler: Box<dyn Handler>,
    /// `pool` is passed to the Handler
    pub pool: AnyPool,
    #[cfg(feature = "metax")]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    pub fn new(
        handler: Box<dyn Handler>,
        pool: AnyPool,
        #[cfg(feature = "metax")] metax: Option<CommandChild>,
    ) -> Self {
        Self {
            handler,
            pool,
            #[cfg(feature = "metax")]
            metax,
        }
    }

    pub async fn cleanup(&mut self) {
        self.pool.close().await;
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
