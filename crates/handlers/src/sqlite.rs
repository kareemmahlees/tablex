use crate::{
    handler::{Handler, RowHandler, TableHandler},
    shared_queries,
};
use async_trait::async_trait;
use serde_json::{
    Map,
    Value::{self as JsonValue},
};
use sqlx::{any::AnyRow, AnyPool};
use tx_lib::{
    types::{ColumnProps, FKRows, FkRelation},
    Result,
};

#[derive(Debug)]
pub struct SQLiteHandler {
    pub(crate) pool: AnyPool,
}

impl SQLiteHandler {
    pub fn new(pool: AnyPool) -> Box<Self> {
        Box::new(SQLiteHandler { pool })
    }
}

impl Handler for SQLiteHandler {}

#[async_trait]
impl TableHandler for SQLiteHandler {
    async fn get_tables(&self) -> Result<Vec<AnyRow>> {
        let query_str = "SELECT name
            FROM sqlite_schema
            WHERE type ='table' 
            AND name NOT LIKE 'sqlite_%';";

        let res = sqlx::query(query_str).fetch_all(&self.pool).await?;

        Ok(res)
    }

    async fn get_columns_props(&self, table_name: String) -> Result<Vec<ColumnProps>> {
        let query_str = "
            SELECT ti.name AS column_name,
                    ti.type AS data_type,
                    CASE WHEN ti.\"notnull\" = 1
                        THEN 0
                        ELSE 1
                        END AS is_nullable,
                    ti.dflt_value AS default_value,
                    ti.pk AS is_pk,
            CASE WHEN ti.name in (SELECt \"from\" FROM PRAGMA_FOREIGN_KEY_LIST($1) WHERE \"from\" = ti.name)
                THEN 1
                ELSE 0
                END AS has_fk_relations
            FROM PRAGMA_TABLE_INFO($1) as ti;
            ";

        let result = sqlx::query_as::<_, ColumnProps>(query_str)
            .bind(&table_name)
            .fetch_all(&self.pool)
            .await?;

        Ok(result)
    }

    async fn execute_raw_query(&self, query: String) -> Result<Vec<Map<String, JsonValue>>> {
        shared_queries::execute_raw_query(&self.pool, query).await
    }
}

#[async_trait]
impl RowHandler for SQLiteHandler {
    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Vec<FKRows>> {
        let query_str =
            "SELECT \"table\",\"to\" FROM pragma_foreign_key_list($1) WHERE \"from\" = $2;";

        let fk_relations = sqlx::query_as::<_, FkRelation>(query_str)
            .bind(&table_name)
            .bind(&column_name)
            .fetch_all(pool)
            .await?;

        let mut result = Vec::new();

        for relation in fk_relations.iter() {
            let query_str = format!(
                "SELECT * from {table_name} where {to} = {column_value};",
                table_name = relation.table,
                to = relation.to,
                column_value = cell_value,
            );

            let rows = sqlx::query(&query_str).fetch_all(pool).await?;

            let decoded_row_data = tx_lib::decode::decode_raw_rows(rows)?;

            result.push(FKRows::new(relation.table.clone(), decoded_row_data));
        }

        Ok(result)
    }
}
