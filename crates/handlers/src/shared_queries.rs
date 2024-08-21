use serde_json::{Map, Value as JsonValue};
use sqlx::AnyPool;
use tx_lib::{decode::decode_raw_rows, Result};

pub(crate) async fn execute_raw_query(
    pool: &AnyPool,
    query: String,
) -> Result<Vec<Map<String, JsonValue>>> {
    let res = sqlx::query(&query).fetch_all(pool).await?;
    let decoded = decode_raw_rows(res).unwrap();
    Ok(decoded)
}
