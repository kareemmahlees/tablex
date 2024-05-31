use sqlx::AnyPool;
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_lib::handler::Handler;

#[derive(Default, Debug)]
pub struct SharedState {
    pub handler: Option<Box<dyn Handler>>,
    /// `pool` is passed to the Handler
    pub pool: Option<AnyPool>,
    #[cfg(feature = "metax")]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    pub async fn cleanup(&mut self) {
        if let Some(pool) = &self.pool {
            pool.close().await
        }

        #[cfg(feature = "metax")]
        {
            if let Some(metax) = self.metax.take() {
                metax.kill().expect("unable to kill sidecar")
            }
        }
    }
}
