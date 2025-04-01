use crate::types::{QueryResult, Schema, TableInfo, TablesNames};
use sea_schema::{
    mysql::discovery::SchemaDiscovery as MySQLSchemaDiscovery,
    postgres::discovery::SchemaDiscovery as PostgresSchemaDiscovery,
    sqlite::discovery::SchemaDiscovery as SqliteSchemaDiscovery,
};
use sqlx::{
    mysql::{MySqlConnectOptions, MySqlPool},
    postgres::{PgConnectOptions, PgPool},
    sqlite::{SqliteConnectOptions, SqlitePool},
};
use tx_lib::TxError;

pub enum DatabaseConnection {
    Sqlite(SqlitePool, SqliteSchemaDiscovery),
    Postgres(PgPool, PostgresSchemaDiscovery),
    Mysql(MySqlPool),
}

impl DatabaseConnection {
    pub async fn connect(url: &str) -> Result<Self, TxError> {
        // TODO: use match statement once if_let_guard feature is stable.
        if let Ok(opts) = url.parse::<SqliteConnectOptions>() {
            let pool = SqlitePool::connect_with(opts).await?;
            Ok(DatabaseConnection::Sqlite(
                pool.clone(),
                SqliteSchemaDiscovery::new(pool),
            ))
        } else if let Ok(opts) = url.parse::<PgConnectOptions>() {
            let pool = PgPool::connect_with(opts).await?;
            return Ok(DatabaseConnection::Postgres(
                pool.clone(),
                PostgresSchemaDiscovery::new(pool, "public"),
            ));
        } else if let Ok(opts) = url.parse::<MySqlConnectOptions>() {
            let pool = MySqlPool::connect_with(opts).await?;
            return Ok(DatabaseConnection::Mysql(pool.clone()));
        } else {
            return Err(TxError::UnsupportedDriver(String::default()));
        }
    }

    pub async fn fetch_all(&self, stmt: &str) -> Result<Vec<QueryResult>, TxError> {
        match self {
            DatabaseConnection::Sqlite(conn, _) => match sqlx::query(stmt).fetch_all(conn).await {
                Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Postgres(conn, _) => {
                match sqlx::query(stmt).fetch_all(conn).await {
                    Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                    Err(err) => Err(err.into()),
                }
            }
            DatabaseConnection::Mysql(conn) => match sqlx::query(stmt).fetch_all(conn).await {
                Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                Err(err) => Err(err.into()),
            },
        }
    }
    pub async fn fetch_one(&self, stmt: &str) -> Result<QueryResult, TxError> {
        match self {
            DatabaseConnection::Sqlite(conn, _) => match sqlx::query(stmt).fetch_one(conn).await {
                Ok(row) => Ok(row.into()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Postgres(conn, _) => {
                match sqlx::query(stmt).fetch_one(conn).await {
                    Ok(row) => Ok(row.into()),
                    Err(err) => Err(err.into()),
                }
            }
            DatabaseConnection::Mysql(conn) => match sqlx::query(stmt).fetch_one(conn).await {
                Ok(row) => Ok(row.into()),
                Err(err) => Err(err.into()),
            },
        }
    }

    pub async fn discover(&self) -> Schema {
        match self {
            DatabaseConnection::Sqlite(_, discoverer) => {
                discoverer.discover().await.unwrap().into()
            }
            DatabaseConnection::Postgres(_, discoverer) => {
                discoverer.discover().await.unwrap().into()
            }
            DatabaseConnection::Mysql(pool) => MySQLSchemaDiscovery::new(pool.clone(), "public")
                .discover()
                .await
                .unwrap()
                .into(),
        }
    }

    pub async fn get_tables(&self) -> TablesNames {
        match self {
            DatabaseConnection::Sqlite(_, schema_discovery) => {
                schema_discovery.discover().await.unwrap().tables.into()
            }
            DatabaseConnection::Postgres(_, schema_discovery) => {
                schema_discovery.discover_tables().await.unwrap().into()
            }
            DatabaseConnection::Mysql(pool) => MySQLSchemaDiscovery::new(pool.clone(), "public")
                .discover_tables()
                .await
                .unwrap()
                .into(),
        }
    }
}
