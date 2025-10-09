use sea_query::{Asterisk, Expr, Func, Iden, Query, SqliteQueryBuilder};
use sea_query_binder::SqlxBinder;
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::{SqlitePool, prelude::FromRow, sqlite::SqliteConnectOptions};
use tauri::{Manager, Runtime};
#[cfg(feature = "metax")]
use tauri_plugin_shell::process::CommandChild;
use tx_handlers::DatabaseConnection;
use tx_lib::{
    TxError,
    types::{ConnConfig, Drivers},
};

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

const STORAGE_FILE_NAME: &str = "data.db";

pub struct Storage {
    pool: SqlitePool,
}

#[derive(Iden)]
#[allow(dead_code)]
enum Connection {
    Table,
    Id,
    Name,
    #[allow(clippy::enum_variant_names)]
    ConnectionString,
    Driver,
    CreatedAt,
    UpdatedAt,
}

impl Storage {
    pub async fn setup<R: Runtime>(app: &tauri::AppHandle<R>) -> Self {
        let mut data_dir = app.path().app_data_dir().unwrap();
        if cfg!(debug_assertions) {
            data_dir.push("dev");
        }
        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir).expect("Failed to recursively create app data dir");
        }
        data_dir.push(STORAGE_FILE_NAME);

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

    pub async fn delete_connection(&self, conn_id: i64) -> Result<(), TxError> {
        let (query, values) = Query::delete()
            .from_table(Connection::Table)
            .and_where(Expr::col(Connection::Id).eq(conn_id))
            .build_sqlx(SqliteQueryBuilder);

        sqlx::query_with(&query, values).execute(&self.pool).await?;
        Ok(())
    }
    pub async fn connections_count(&self) -> Result<i64, TxError> {
        let (query, values) = Query::select()
            .expr(Func::count(Expr::col(Connection::Id)))
            .from(Connection::Table)
            .build_sqlx(SqliteQueryBuilder);

        #[derive(FromRow)]
        struct ConnectionsCount(i64);

        let res = sqlx::query_as_with::<_, ConnectionsCount, _>(&query, values)
            .fetch_one(&self.pool)
            .await?;
        Ok(res.0)
    }

    pub async fn get_all_connections(&self) -> Result<Vec<ConnConfig>, TxError> {
        let (query, values) = Query::select()
            .from(Connection::Table)
            .column(Asterisk)
            .build_sqlx(SqliteQueryBuilder);

        let res = sqlx::query_as_with::<_, ConnConfig, _>(&query, values)
            .fetch_all(&self.pool)
            .await?;

        Ok(res)
    }

    pub async fn get_connection_by_id(&self, conn_id: i64) -> Result<ConnConfig, TxError> {
        let (query, values) = Query::select()
            .from(Connection::Table)
            .column(Asterisk)
            .and_where(Expr::col(Connection::Id).eq(conn_id))
            .build_sqlx(SqliteQueryBuilder);

        let res = sqlx::query_as_with::<_, ConnConfig, _>(&query, values)
            .fetch_one(&self.pool)
            .await?;
        Ok(res)
    }
}
