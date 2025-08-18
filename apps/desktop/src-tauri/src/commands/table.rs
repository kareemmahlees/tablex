use crate::AppState;
use sea_query_binder::SqlxValues;
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlparser::{
    ast::Statement,
    dialect::{Dialect, MySqlDialect, PostgreSqlDialect, SQLiteDialect},
    parser::Parser,
};
use tx_handlers::{DatabaseConnection, DecodedRow, ExecResult, TableInfo, decode_raw_rows};
use tx_lib::Result;

#[tauri::command]
#[specta::specta]
pub async fn get_tables(state: AppState<'_>) -> Result<Vec<String>> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let tables = conn.get_tables().await;

    Ok(tables.0)
}

#[tauri::command]
#[specta::specta]
pub async fn discover_db_schema(state: AppState<'_>) -> Result<Vec<TableInfo>> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let schema_discovery = conn.discover().await.tables;

    Ok(schema_discovery)
}

#[derive(Serialize, Deserialize, Type)]
pub enum RawQueryResult {
    Query(Vec<DecodedRow>),
    Exec(ExecResult),
}

#[tauri::command]
#[specta::specta]
pub async fn execute_raw_query(state: AppState<'_>, query: String) -> Result<RawQueryResult> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();

    let dialect: &dyn Dialect = match conn {
        DatabaseConnection::Sqlite(_, _) => &SQLiteDialect {},
        DatabaseConnection::Postgres(_, _) => &PostgreSqlDialect {},
        DatabaseConnection::Mysql(_) => &MySqlDialect {},
    };

    let ast = Parser::parse_sql(dialect, query.as_str())?;
    for (i, stmt) in ast.iter().enumerate() {
        match stmt {
            Statement::Query(q) => {
                if i == ast.len() - 1 {
                    // It' the last query, execute it.
                    let rows = conn
                        .fetch_all(&q.to_string(), SqlxValues(sea_query::Values(vec![])))
                        .await?;
                    return Ok(RawQueryResult::Query(decode_raw_rows(rows)?));
                } else {
                    continue;
                }
            }
            e => {
                let res = conn.execute(&e.to_string()).await?;
                if i == ast.len() - 1 {
                    return Ok(RawQueryResult::Exec(res));
                } else {
                    continue;
                }
            }
        }
    }

    Ok(RawQueryResult::Query(vec![]))
}
