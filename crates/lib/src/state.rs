use crate::Drivers;
use sqlx::sqlite::SqlitePool;
use sqlx::{MySqlPool, PgPool};
#[cfg(not(debug_assertions))]
use tauri::api::process::CommandChild;

#[derive(Default, Debug)]
pub struct SharedState {
    pub sqlite_pool: Option<SqlitePool>,
    pub postgres_pool: Option<PgPool>,
    pub mysql_pool: Option<MySqlPool>,
    pub driver: Option<Drivers>,
    #[cfg(not(debug_assertions))]
    pub metax: Option<CommandChild>,
}

impl SharedState {
    pub async fn cleanup(&mut self) {
        if let Some(sqlite_pool) = &self.sqlite_pool {
            sqlite_pool.close().await
        }

        if let Some(pg_pool) = &self.postgres_pool {
            pg_pool.close().await
        }

        if let Some(mysql_pool) = &self.mysql_pool {
            mysql_pool.close().await
        }

        #[cfg(not(debug_assertions))]
        {
            if let Some(metax) = self.metax.take() {
                metax.kill().expect("unable to kill sidecar")
            }
        }
    }
}
