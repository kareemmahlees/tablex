use crate::{
    query::{ExecResult, QueryResult},
    schema::{Schema, TablesNames},
};
use sea_query_binder::SqlxValues;
use sea_schema::{
    mysql::discovery::SchemaDiscovery as MySQLSchemaDiscovery,
    postgres::discovery::SchemaDiscovery as PostgresSchemaDiscovery,
    sea_query::{MysqlQueryBuilder, PostgresQueryBuilder, QueryBuilder, SqliteQueryBuilder},
    sqlite::discovery::SchemaDiscovery as SqliteSchemaDiscovery,
};
use sqlx::{
    mysql::{MySqlConnectOptions, MySqlPool},
    postgres::{PgConnectOptions, PgPool},
    sqlite::{SqliteConnectOptions, SqlitePool},
};
use tx_lib::{types::Drivers, TxError};

pub enum DatabaseConnection {
    Sqlite(SqlitePool, SqliteSchemaDiscovery),
    Postgres(PgPool, PostgresSchemaDiscovery),
    Mysql(MySqlPool),
}

impl DatabaseConnection {
    pub async fn connect(url: &str, driver: Drivers) -> Result<Self, TxError> {
        // TODO: use match statement once if_let_guard feature is stable.
        let con = match driver {
            Drivers::SQLite => {
                let pool = SqlitePool::connect_with(url.parse::<SqliteConnectOptions>()?).await?;
                DatabaseConnection::Sqlite(pool.clone(), SqliteSchemaDiscovery::new(pool))
            }
            Drivers::PostgreSQL => {
                let pool = PgPool::connect_with(url.parse::<PgConnectOptions>()?).await?;
                DatabaseConnection::Postgres(
                    pool.clone(),
                    PostgresSchemaDiscovery::new(pool, "public"),
                )
            }
            Drivers::MySQL => {
                let pool = MySqlPool::connect_with(url.parse::<MySqlConnectOptions>()?).await?;
                DatabaseConnection::Mysql(pool.clone())
            }
        };
        Ok(con)

        // if let Ok(opts) = url.parse::<SqliteConnectOptions>() {
        //     dbg!("connection is sqlite");
        //     let pool = SqlitePool::connect_with(opts).await?;
        //     Ok(DatabaseConnection::Sqlite(
        //         pool.clone(),
        //         SqliteSchemaDiscovery::new(pool),
        //     ))
        // } else if let Ok(opts) = url.parse::<PgConnectOptions>() {
        //     let pool = PgPool::connect_with(opts).await?;
        //     return Ok(DatabaseConnection::Postgres(
        //         pool.clone(),
        //         PostgresSchemaDiscovery::new(pool, "public"),
        //     ));
        // } else if let Ok(opts) = url.parse::<MySqlConnectOptions>() {
        //     let pool = MySqlPool::connect_with(opts).await?;
        //     return Ok(DatabaseConnection::Mysql(pool.clone()));
        // } else {
        //     return Err(TxError::UnsupportedDriver(String::default()));
        // }
    }
    pub fn into_builder(&self) -> Box<dyn QueryBuilder> {
        match self {
            DatabaseConnection::Sqlite(_, _) => Box::new(SqliteQueryBuilder),
            DatabaseConnection::Postgres(_, _) => Box::new(PostgresQueryBuilder),
            DatabaseConnection::Mysql(_) => Box::new(MysqlQueryBuilder),
        }
    }
    pub async fn fetch_all(
        &self,
        stmt: &str,
        values: SqlxValues,
    ) -> Result<Vec<QueryResult>, TxError> {
        match self {
            DatabaseConnection::Sqlite(conn, _) => {
                match sqlx::query_with(stmt, values).fetch_all(conn).await {
                    Ok(rows) => {
                        dbg!("ok");
                        Ok(rows.into_iter().map(|r| r.into()).collect())
                    }
                    Err(err) => {
                        dbg!(&err);
                        Err(err.into())
                    }
                }
            }
            DatabaseConnection::Postgres(conn, _) => {
                match sqlx::query_with(stmt, values).fetch_all(conn).await {
                    Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                    Err(err) => Err(err.into()),
                }
            }
            DatabaseConnection::Mysql(conn) => {
                match sqlx::query_with(stmt, values).fetch_all(conn).await {
                    Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                    Err(err) => Err(err.into()),
                }
            }
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
    pub async fn execute(&self, stmt: &str) -> Result<ExecResult, TxError> {
        let res: ExecResult = match self {
            DatabaseConnection::Sqlite(conn, _) => sqlx::query(stmt).execute(conn).await?.into(),
            DatabaseConnection::Postgres(conn, _) => sqlx::query(stmt).execute(conn).await?.into(),
            DatabaseConnection::Mysql(conn) => sqlx::query(stmt).execute(conn).await?.into(),
        };

        Ok(res)
    }
    pub async fn execute_with(
        &self,
        stmt: &str,
        values: SqlxValues,
    ) -> Result<ExecResult, TxError> {
        let res: ExecResult = match self {
            DatabaseConnection::Sqlite(conn, _) => {
                sqlx::query_with(stmt, values).execute(conn).await?.into()
            }
            DatabaseConnection::Postgres(conn, _) => {
                sqlx::query_with(stmt, values).execute(conn).await?.into()
            }
            DatabaseConnection::Mysql(conn) => {
                sqlx::query_with(stmt, values).execute(conn).await?.into()
            }
        };

        Ok(res)
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
