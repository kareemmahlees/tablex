use crate::{
    query::{ExecResult, QueryResult},
    schema::Schema,
};
use sea_query_binder::SqlxValues;
use sea_schema::{
    mysql::discovery::SchemaDiscovery as MySQLSchemaDiscovery,
    postgres::discovery::SchemaDiscovery as PostgresSchemaDiscovery,
    sea_query::{MysqlQueryBuilder, PostgresQueryBuilder, QueryBuilder, SqliteQueryBuilder},
    sqlite::discovery::SchemaDiscovery as SqliteSchemaDiscovery,
};
use sqlx::{
    Connection,
    mysql::{MySqlConnectOptions, MySqlPool},
    postgres::{PgConnectOptions, PgPool},
    sqlite::{SqliteConnectOptions, SqlitePool},
};
use tx_lib::{Result, TxError, types::Drivers};

pub enum DatabaseConnection {
    Sqlite { pool: SqlitePool, schema: Schema },
    Postgres { pool: PgPool, schema: Schema },
    Mysql { pool: MySqlPool, schema: Schema },
}

impl DatabaseConnection {
    pub async fn connect(url: &str, driver: &Drivers) -> Result<Self> {
        // TODO: use match statement once if_let_guard feature is stable.
        let con = match driver {
            Drivers::SQLite => {
                let pool = SqlitePool::connect_with(url.parse::<SqliteConnectOptions>()?).await?;
                let schema = SqliteSchemaDiscovery::new(pool.clone())
                    .discover()
                    .await
                    .unwrap()
                    .into();
                DatabaseConnection::Sqlite { pool, schema }
            }
            Drivers::PostgreSQL => {
                let pool = PgPool::connect_with(url.parse::<PgConnectOptions>()?).await?;
                let schema = PostgresSchemaDiscovery::new(pool.clone(), "public")
                    .discover()
                    .await
                    .unwrap()
                    .into();
                DatabaseConnection::Postgres { pool, schema }
            }
            Drivers::MySQL => {
                let pool = MySqlPool::connect_with(url.parse::<MySqlConnectOptions>()?).await?;
                let schema = MySQLSchemaDiscovery::new(pool.clone(), "public")
                    .discover()
                    .await
                    .unwrap()
                    .into();
                DatabaseConnection::Mysql { pool, schema }
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
            DatabaseConnection::Sqlite { .. } => Box::new(SqliteQueryBuilder),
            DatabaseConnection::Postgres { .. } => Box::new(PostgresQueryBuilder),
            DatabaseConnection::Mysql { .. } => Box::new(MysqlQueryBuilder),
        }
    }
    pub async fn ping(url: &str, driver: &Drivers) -> Result<()> {
        match driver {
            Drivers::SQLite => {
                let pool = SqlitePool::connect_with(url.parse::<SqliteConnectOptions>()?).await?;

                let ping_result = pool
                    .acquire()
                    .await?
                    .ping()
                    .await
                    .map_err(|_| TxError::PingError);

                pool.close().await;

                ping_result
            }
            Drivers::PostgreSQL => {
                let pool = PgPool::connect_with(url.parse::<PgConnectOptions>()?).await?;

                let ping_result = pool
                    .acquire()
                    .await?
                    .ping()
                    .await
                    .map_err(|_| TxError::PingError);

                pool.close().await;

                ping_result
            }
            Drivers::MySQL => {
                let pool = MySqlPool::connect_with(url.parse::<MySqlConnectOptions>()?).await?;

                let ping_result = pool
                    .acquire()
                    .await?
                    .ping()
                    .await
                    .map_err(|_| TxError::PingError);

                pool.close().await;

                ping_result
            }
        }
    }
    pub async fn fetch_all(&self, stmt: &str, values: SqlxValues) -> Result<Vec<QueryResult>> {
        let res = match self {
            DatabaseConnection::Sqlite { pool, .. } => sqlx::query_with(stmt, values)
                .fetch_all(pool)
                .await?
                .into_iter()
                .map(|r| r.into())
                .collect(),
            DatabaseConnection::Postgres { pool, .. } => sqlx::query_with(stmt, values)
                .fetch_all(pool)
                .await?
                .into_iter()
                .map(|r| r.into())
                .collect(),
            DatabaseConnection::Mysql { pool, .. } => sqlx::query_with(stmt, values)
                .fetch_all(pool)
                .await?
                .into_iter()
                .map(|r| r.into())
                .collect(),
        };
        Ok(res)
    }
    pub async fn fetch_one(&self, stmt: &str) -> Result<QueryResult> {
        let res: QueryResult = match self {
            DatabaseConnection::Sqlite { pool, .. } => {
                sqlx::query(stmt).fetch_one(pool).await?.into()
            }
            DatabaseConnection::Postgres { pool, .. } => {
                sqlx::query(stmt).fetch_one(pool).await?.into()
            }
            DatabaseConnection::Mysql { pool, .. } => {
                sqlx::query(stmt).fetch_one(pool).await?.into()
            }
        };

        Ok(res)
    }
    pub async fn execute(&self, stmt: &str) -> Result<ExecResult> {
        let res: ExecResult = match self {
            DatabaseConnection::Sqlite { pool, .. } => {
                sqlx::query(stmt).execute(pool).await?.into()
            }
            DatabaseConnection::Postgres { pool, .. } => {
                sqlx::query(stmt).execute(pool).await?.into()
            }
            DatabaseConnection::Mysql { pool, .. } => sqlx::query(stmt).execute(pool).await?.into(),
        };

        Ok(res)
    }
    pub async fn execute_with(&self, stmt: &str, values: SqlxValues) -> Result<ExecResult> {
        let res: ExecResult = match self {
            DatabaseConnection::Sqlite { pool, .. } => {
                sqlx::query_with(stmt, values).execute(pool).await?.into()
            }
            DatabaseConnection::Postgres { pool, .. } => {
                sqlx::query_with(stmt, values).execute(pool).await?.into()
            }
            DatabaseConnection::Mysql { pool, .. } => {
                sqlx::query_with(stmt, values).execute(pool).await?.into()
            }
        };

        Ok(res)
    }
    pub async fn get_schema(&self) -> Schema {
        match self {
            DatabaseConnection::Sqlite { schema, .. } => schema.clone(),
            DatabaseConnection::Postgres { schema, .. } => schema.clone(),
            DatabaseConnection::Mysql { schema, .. } => schema.clone(),
        }
    }

    pub async fn close(&self) {
        match self {
            DatabaseConnection::Sqlite { pool, .. } => pool.close().await,
            DatabaseConnection::Postgres { pool, .. } => pool.close().await,
            DatabaseConnection::Mysql { pool, .. } => pool.close().await,
        }
    }
}
