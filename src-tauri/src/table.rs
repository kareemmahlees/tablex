use crate::DbInstance;
use sqlx::Row;
use tauri::State;

#[tauri::command]
pub async fn get_tables(connection: State<'_, DbInstance>) -> Result<Option<Vec<String>>, ()> {
    let long_lived = connection.pool.lock().await;
    let conn = long_lived.as_ref().unwrap();
    let rows = sqlx::query(
        "SELECT name
         FROM sqlite_schema
         WHERE type ='table' 
         AND name NOT LIKE 'sqlite_%';",
    )
    .fetch_all(conn)
    .await
    .unwrap();
    if rows.len() == 0 {
        ()
    }
    let mut result: Vec<String> = vec![];
    for (_, row) in rows.iter().enumerate() {
        result.push(row.get::<String, &str>("name"))
    }
    Ok(Some(result))
}
