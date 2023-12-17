pub fn get_tables_sqlite() -> &'static str {
    "SELECT name
    FROM sqlite_schema
    WHERE type ='table' 
    AND name NOT LIKE 'sqlite_%';" as _
}

pub fn get_columns_definition_sqlite(table_name: String) -> String {
    format!(
        "select name,type,\"notnull\",dflt_value,pk from pragma_table_info('{}');",
        table_name
    )
    .to_string()
}
