use crate::handler::{Handler, RowHandler, TableHandler};
use async_trait::async_trait;
use serde_json::Value::{self as JsonValue};
use sqlx::{any::AnyRow, AnyPool};
use tx_lib::{
    types::{ColumnProps, FKRows, FkRelation},
    Result,
};

#[derive(Debug)]
pub struct MySQLHandler;

impl Handler for MySQLHandler {}

#[async_trait]
impl TableHandler for MySQLHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>> {
        let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        let query_str = "show tables;";

        let res = sqlx::query(query_str).fetch_all(pool).await?;
        Ok(res)
    }
    async fn get_columns_props(
        &self,
        pool: &AnyPool,
        table_name: String,
    ) -> Result<Vec<ColumnProps>> {
        let query_str = "SELECT cols.column_name AS column_name,
                        cols.data_type AS data_type,
                        cols.is_nullable = \"YES\" AS is_nullable,
                        cols.column_default AS default_value,
                        GROUP_CONCAT(tc.constraint_type) LIKE '%PRIMARY KEY%' AS is_pk,
                        GROUP_CONCAT(tc.constraint_type) LIKE '%FOREIGN KEY%' AS has_fk_relations
                FROM information_schema.columns AS cols
                LEFT JOIN information_schema.key_column_usage AS kcu ON kcu.column_name = cols.column_name
                LEFT JOIN information_schema.table_constraints AS tc ON tc.constraint_name = kcu.constraint_name
                WHERE cols.table_name = ?
                GROUP BY cols.column_name, cols.data_type, cols.is_nullable, cols.column_default;";

        let result = sqlx::query_as::<_, ColumnProps>(query_str)
            .bind(&table_name)
            .fetch_all(pool)
            .await?;

        Ok(result)
    }
}

#[async_trait]
impl RowHandler for MySQLHandler {
    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Vec<FKRows>> {
        let query_str = "
            SELECT referenced_table_name AS \"table\",
                referenced_column_name AS \"to\"
            FROM
                information_schema.key_column_usage
            WHERE table_name = ?
                AND column_name = ?
                AND referenced_table_name IS NOT NULL;
            ";

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
