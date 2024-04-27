use async_trait::async_trait;
use serde_json::Value::{Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use tx_lib::handler::{Handler, RowHandler, TableHandler};
use tx_lib::{ColumnProps, FkRelation};

#[derive(Debug)]
pub struct SQLiteHandler;

impl Handler for SQLiteHandler {}

#[async_trait]
impl TableHandler for SQLiteHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        sqlx::query(
            "SELECT name
            FROM sqlite_schema
            WHERE type ='table' 
            AND name NOT LIKE 'sqlite_%';",
        )
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())
    }

    async fn get_columns_props(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Vec<ColumnProps>, String> {
        let rows = sqlx::query(
            format!(
            "
            SELECT ti.name,ti.type,ti.\"notnull\",ti.dflt_value,ti.pk,
            CASE WHEN ti.name in (SELECt \"from\" FROM PRAGMA_FOREIGN_KEY_LIST('{table_name}') WHERE \"from\" = ti.name)
                THEN 1
                ELSE 0
                END AS has_fk_relation
            FROM PRAGMA_TABLE_INFO('{table_name}') as ti;
            "
        )
            .as_str(),
        )
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

        let columns = rows
            .iter()
            .map(|row| {
                ColumnProps::new(
                    row.get(0),
                    JsonString(row.get(1)),
                    JsonBool(!row.get::<i16, usize>(2) == 0),
                    tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                    JsonBool(row.get::<i16, usize>(4) == 1),
                    JsonBool(row.get::<i16, usize>(5) == 1),
                )
            })
            .collect();

        Ok(columns)
    }
}

#[async_trait]
impl RowHandler for SQLiteHandler {
    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Option<Vec<FkRelation>>, String> {
        let rows =
            sqlx::query("SELECT \"table\",\"to\" FROM pragma_foreign_key_list('{table_name}');")
                .fetch_all(pool)
                .await
                .map_err(|err| err.to_string())?;

        if rows.is_empty() {
            return Ok(None);
        }

        let fk_relations = rows
            .iter()
            .map(|row| FkRelation::new(row.get(0), row.get(1)))
            .collect();

        Ok(Some(fk_relations))
    }
}

/*
SELECT ti.name,ti.type,ti."notnull",ti.dflt_value,ti.pk,
CASE WHEN ti.name in (SELECt "from" FROM PRAGMA_FOREIGN_KEY_LIST('test_table') WHERE "from" = ti.name)
       THEN 1
       ELSE 0
       END AS has_fk_relation
FROM PRAGMA_TABLE_INFO('test_table') as ti;
 */
