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
pub async fn discover_db_schema(state: AppState<'_>) -> Result<Vec<TableInfo>> {
    let state = state.lock().await;
    let conn = state.conn.as_ref().unwrap();
    let schema_discovery = conn.get_schema().await.tables;

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
        DatabaseConnection::Sqlite { .. } => &SQLiteDialect {},
        DatabaseConnection::Postgres { .. } => &PostgreSqlDialect {},
        DatabaseConnection::Mysql { .. } => &MySqlDialect {},
    };

    let mut ast = Parser::parse_sql(dialect, query.as_str())?;
    let ast_len = ast.len();
    for (i, stmt) in ast.iter_mut().enumerate() {
        match stmt {
            Statement::Query(q) => {
                if i != ast_len - 1 {
                    continue;
                }
                // // It' the last query, execute it.
                // if let sqlparser::ast::SetExpr::Select(select) = &mut *q.body {
                //     for item in &mut select.projection {
                //         if let SelectItem::UnnamedExpr(expr) = item {
                //             let col_name = match expr {
                //                 Expr::Identifier(ident) => ident.value.clone(),
                //                 Expr::CompoundIdentifier(idents) => {
                //                     idents.last().unwrap().value.clone()
                //                 }
                //                 _ => unimplemented!(),
                //             };
                //             for table in conn.get_schema().await.tables {
                //                 for column in table.columns {
                //                     if column.name == col_name
                //                         && let CustomColumnType::Enum(_) = column.r#type
                //                     {
                //                         *expr = Expr::Cast {
                //                             expr: Box::new(expr.clone()),
                //                             data_type: DataType::Text,
                //                             format: None,
                //                             kind: CastKind::DoubleColon,
                //                         };
                //                         break;
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // };
                let rows = conn
                    .fetch_all(&q.to_string(), SqlxValues(sea_query::Values(vec![])))
                    .await?;
                return Ok(RawQueryResult::Query(decode_raw_rows(rows)?));
            }
            e => {
                let res = conn.execute(&e.to_string()).await?;
                if i != ast_len - 1 {
                    continue;
                }

                return Ok(RawQueryResult::Exec(res));
            }
        }
    }

    Ok(RawQueryResult::Query(vec![]))
}
