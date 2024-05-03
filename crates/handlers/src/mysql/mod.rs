use async_trait::async_trait;
use serde_json::Value::{self as JsonValue, Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use tx_lib::handler::{Handler, RowHandler, TableHandler};
use tx_lib::{ColumnProps, FKRows, FkRelation};

#[derive(Debug)]
pub struct MySQLHandler;

impl Handler for MySQLHandler {}

#[async_trait]
impl TableHandler for MySQLHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query("show tables;")
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
                "SELECT cols.column_name,
                        cols.data_type,
                        cols.is_nullable = \"YES\" AS is_nullable,
                        cols.column_default,
                        GROUP_CONCAT(tc.constraint_type) LIKE '%PRIMARY KEY%' AS is_pk,
                        GROUP_CONCAT(tc.constraint_type) LIKE '%FOREIGN KEY%' AS has_fk_relation
                FROM information_schema.columns AS cols
                LEFT JOIN information_schema.key_column_usage AS kcu ON kcu.column_name = cols.column_name
                LEFT JOIN information_schema.table_constraints AS tc ON tc.constraint_name = kcu.constraint_name
                WHERE cols.table_name = ?
                GROUP BY cols.column_name, cols.data_type, cols.is_nullable, cols.column_default;"
        )
        .bind(&table_name)
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

        let mut columns = Vec::new();

        rows.iter().for_each(|row| {
            let column_name = row.get::<String, usize>(0);

            let column_props = ColumnProps::new(
                column_name,
                JsonString(row.get(1)),
                JsonBool(row.get::<i16, usize>(2) == 1),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<i16, usize>(4) == 1),
                JsonBool(row.get::<i16, usize>(5) == 1),
            );

            columns.push(column_props);
        });
        Ok(columns)
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
    ) -> Result<Option<Vec<FKRows>>, String> {
        let fk_relations = sqlx::query_as::<_, FkRelation>(
            "
            SELECT referenced_table_name AS \"table\",
                referenced_column_name AS \"to\"
            FROM
                information_schema.key_column_usage
            WHERE table_name = ?
                AND column_name = ?
                AND referenced_table_name IS NOT NULL;
            ",
        )
        .bind(&table_name)
        .bind(&column_name)
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

        if fk_relations.is_empty() {
            return Ok(None);
        }

        let mut result = Vec::new();

        for relation in fk_relations.iter() {
            let rows = sqlx::query(
                format!(
                    "SELECT * from {table_name} where {to} = {column_value};",
                    table_name = relation.table,
                    to = relation.to,
                    column_value = cell_value,
                )
                .as_str(),
            )
            .fetch_all(pool)
            .await
            .map_err(|err| err.to_string())?;

            let decoded_row_data = tx_lib::decode::decode_raw_rows(rows)?;

            result.push(FKRows::new(table_name.clone(), decoded_row_data));
        }

        Ok(Some(result))
    }
}
