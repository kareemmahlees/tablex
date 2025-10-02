use sea_query::{Iden, Query, SqliteQueryBuilder};
use sea_query_binder::SqlxBinder;
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use tauri::{AppHandle, Manager, Runtime};
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::DatabaseConnection;
use tx_lib::{TxError, types::Drivers};

#[derive(Default)]
pub struct SharedState {
    pub conn: Option<DatabaseConnection>,
    pub conn_string: Option<String>,
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

#[derive(Default, Clone, Type, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum MetaXStatus {
    Active,
    #[default]
    Exited,
    Paused,
}

#[derive(Default, Debug)]
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

const STORAGE_FILE_PATH: &str = if cfg!(debug_assertions) {
    "dev/data.db"
} else {
    "data.db"
};

pub struct Storage {
    pool: SqlitePool,
}

#[derive(Iden)]
enum Connection {
    Table,
    Name,
    ConnectionString,
    Driver,
    CreatedAt,
    UpdatedAt,
}

impl Storage {
    pub async fn setup<R: Runtime>(app: &tauri::AppHandle<R>) -> Self {
        let mut data_dir = app.path().app_data_dir().unwrap();
        data_dir.push(STORAGE_FILE_PATH);

        let pool = SqlitePool::connect_with(
            SqliteConnectOptions::new()
                .filename(data_dir)
                .create_if_missing(true),
        )
        .await
        .expect("Failed to establish connection");
        sqlx::migrate!()
            .run(&pool)
            .await
            .expect("Failed to run migrations");
        Self { pool }
    }

    pub async fn insert_connection(
        &self,
        conn_string: String,
        conn_name: String,
        driver: Drivers,
    ) -> Result<i64, TxError> {
        let (query, values) = Query::insert()
            .into_table(Connection::Table)
            .columns([
                Connection::Name,
                Connection::ConnectionString,
                Connection::Driver,
            ])
            .values_panic([
                conn_name.into(),
                conn_string.into(),
                driver.to_string().into(),
            ])
            .build_sqlx(SqliteQueryBuilder);
        let res = sqlx::query_with(&query, values).execute(&self.pool).await?;
        Ok(res.last_insert_rowid())
    }
}
