use crate::handler::Handler;
use sqlx::AnyPool;
#[cfg(not(debug_assertions))]
use tauri::api::process::CommandChild;

#[derive(Default, Debug)]
pub struct SharedState {
    pub handler: Option<Box<dyn Handler>>,
    /// `pool` is passed to the Handler
    pub pool: Option<AnyPool>,
    #[cfg(not(debug_assertions))]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    pub async fn cleanup(&mut self) {
        if let Some(pool) = &self.pool {
            pool.close().await
        }

        #[cfg(not(debug_assertions))]
        {
            if let Some(metax) = self.metax.take() {
                metax.kill().expect("unable to kill sidecar")
            }
        }
    }
}
