use sqlx::{
    mysql::{MySqlConnectOptions, MySqlPool, MySqlRow},
    postgres::{PgConnectOptions, PgPool, PgRow},
    sqlite::{SqliteConnectOptions, SqlitePool, SqliteRow},
    ColumnIndex, Decode, Row,
};
use tx_lib::TxError;

#[derive(Debug)]
pub enum DatabaseConnection {
    Sqlite(SqlitePool),
    Postgres(PgPool),
    Mysql(MySqlPool),
}

impl DatabaseConnection {
    pub async fn connect(url: &str) -> Result<Self, TxError> {
        // TODO: use match statement once if_let_guard feature is stable.
        if let Ok(opts) = url.parse::<SqliteConnectOptions>() {
            return Ok(DatabaseConnection::Sqlite(
                SqlitePool::connect_with(opts).await?, // SqliteConnection::connect_with(&opts).await?,
            ));
        } else if let Ok(opts) = url.parse::<PgConnectOptions>() {
            return Ok(DatabaseConnection::Postgres(
                PgPool::connect_with(opts).await?,
            ));
        } else if let Ok(opts) = url.parse::<MySqlConnectOptions>() {
            return Ok(DatabaseConnection::Mysql(
                MySqlPool::connect_with(opts).await?,
            ));
        } else {
            return Err(TxError::UnsupportedDriver(String::default()));
        }
    }

    pub async fn fetch_all(&self, stmt: &str) -> Result<Vec<QueryResult>, TxError> {
        match self {
            DatabaseConnection::Sqlite(conn) => match sqlx::query(stmt).fetch_all(conn).await {
                Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Postgres(conn) => match sqlx::query(stmt).fetch_all(conn).await {
                Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Mysql(conn) => match sqlx::query(stmt).fetch_all(conn).await {
                Ok(rows) => Ok(rows.into_iter().map(|r| r.into()).collect()),
                Err(err) => Err(err.into()),
            },
        }
    }
    pub async fn fetch_one(&self, stmt: &str) -> Result<QueryResult, TxError> {
        match self {
            DatabaseConnection::Sqlite(conn) => match sqlx::query(stmt).fetch_one(conn).await {
                Ok(row) => Ok(row.into()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Postgres(conn) => match sqlx::query(stmt).fetch_one(conn).await {
                Ok(row) => Ok(row.into()),
                Err(err) => Err(err.into()),
            },
            DatabaseConnection::Mysql(conn) => match sqlx::query(stmt).fetch_one(conn).await {
                Ok(row) => Ok(row.into()),
                Err(err) => Err(err.into()),
            },
        }
    }
}

pub struct QueryResult {
    pub(crate) row: QueryResultRow,
}

impl From<MySqlRow> for QueryResult {
    fn from(row: MySqlRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxMySql(row),
        }
    }
}
impl From<PgRow> for QueryResult {
    fn from(row: PgRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxPostgres(row),
        }
    }
}
impl From<SqliteRow> for QueryResult {
    fn from(row: SqliteRow) -> QueryResult {
        QueryResult {
            row: QueryResultRow::SqlxSqlite(row),
        }
    }
}

#[allow(clippy::enum_variant_names)]
pub(crate) enum QueryResultRow {
    SqlxMySql(MySqlRow),
    SqlxPostgres(PgRow),
    SqlxSqlite(SqliteRow),
}

impl QueryResultRow {
    pub fn try_get<'r, T, I>(&'r self, index: I) -> Result<T, sqlx::Error>
    where
        I: ColumnIndex<Self>,
        T: Decode<'r, Self::Database> + Type<Self::Database>,
    {
        match self {
            QueryResultRow::SqlxMySql(row) => row.try_get(index),
            QueryResultRow::SqlxPostgres(row) => todo!(),
            QueryResultRow::SqlxSqlite(row) => todo!(),
        }
    }
}
