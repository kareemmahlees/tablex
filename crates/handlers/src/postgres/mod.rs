use async_trait::async_trait;
use serde_json::Value::{self as JsonValue, Bool as JsonBool, String as JsonString};
use sqlx::{any::AnyRow, AnyPool, Row};
use tx_lib::handler::{Handler, RowHandler, TableHandler};
use tx_lib::{ColumnProps, FKRows, FkRelation};

#[derive(Debug)]
pub struct PostgresHandler;
impl Handler for PostgresHandler {}

#[async_trait]
impl TableHandler for PostgresHandler {
    async fn get_tables(&self, pool: &AnyPool) -> Result<Vec<AnyRow>, String> {
        let _ = pool.acquire().await; // This line is only added due to weird behavior when running the CLI
        sqlx::query(
            "SELECT \"table_name\"
            FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
                AND table_schema = 'public';",
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
            format!("SELECT col.column_name,
                    col.data_type,
                    CASE
                                    WHEN col.is_nullable = 'YES' THEN TRUE
                                    ELSE FALSE
                    END is_nullable,
                    col.column_default,
                    CASE
                                    WHEN col.column_name in
                                                            (SELECT ccu.column_name
                                                                FROM information_schema.constraint_column_usage AS ccu
                                                                LEFT JOIN information_schema.table_constraints AS tc ON ccu.constraint_name = tc.constraint_name
                                                                AND tc.constraint_type = 'PRIMARY KEY'
                                                                WHERE ccu.table_name = '{table_name}' ) THEN TRUE
                                    ELSE FALSE
                    END is_pk,
                    CASE
                                    WHEN col.column_name in
                                                            (SELECT
                                                                kcu.column_name
                                                            FROM information_schema.table_constraints AS tc
                                                            JOIN information_schema.key_column_usage AS kcu
                                                                ON tc.constraint_name = kcu.constraint_name
                                                                AND tc.table_schema = kcu.table_schema
                                                            JOIN information_schema.constraint_column_usage AS ccu
                                                                ON ccu.constraint_name = tc.constraint_name
                                                            WHERE tc.constraint_type = 'FOREIGN KEY'
                                                                AND tc.table_schema='public'
                                                                AND tc.table_name= '{table_name}'
                                                ) THEN TRUE
                                    ELSE FALSE
                    END has_fk_relations
            FROM information_schema.columns AS COL
            WHERE col.table_name = '{table_name}' ORDER BY col.ordinal_position;").as_str()
        )
        .fetch_all(pool)
        .await
        .map_err(|err| err.to_string())?;

        let mut columns = Vec::new();

        rows.iter().for_each(|row| {
            let column_name = row.get::<String, usize>(0);

            let column_props = ColumnProps::new(
                column_name,
                JsonString(row.get(1)),
                JsonBool(row.get::<bool, usize>(2)),
                tx_lib::decode::to_json(row.try_get_raw(3).unwrap()).unwrap(),
                JsonBool(row.get::<bool, usize>(4)),
                // TODO change
                JsonBool(row.get::<bool, usize>(5)),
            );

            columns.push(column_props);
        });
        Ok(columns)
    }
}

#[async_trait]
impl RowHandler for PostgresHandler {
    async fn fk_relations(
        &self,
        pool: &AnyPool,
        table_name: String,
        column_name: String,
        cell_value: JsonValue,
    ) -> Result<Option<Vec<FKRows>>, String> {
        let fk_relations = sqlx::query_as::<_, FkRelation>(
            "
            SELECT
                ccu.table_name AS table,
                ccu.column_name AS to
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND  kcu.column_name = $1
                AND tc.table_schema='public'
                AND tc.table_name= $2;
            ",
        )
        .bind(&column_name)
        .bind(&table_name)
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

        dbg!(&result);
        Ok(Some(result))
    }
}
