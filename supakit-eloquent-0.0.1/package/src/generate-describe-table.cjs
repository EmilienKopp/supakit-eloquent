// generate-describe-table.js
const fs = require('fs');

function generateDescribeTableSQL() {
    const sql = `CREATE OR REPLACE FUNCTION describe_table(tablename text)
    RETURNS TABLE(column_name text, ordinal_position int, is_nullable text, data_type text) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text, 
        c.is_nullable::text, 
        c.data_type::text 
    FROM 
        information_schema.columns as c
    WHERE 
        table_name = describe_table.tablename;
    END;
    $$ LANGUAGE plpgsql;`;

    return sql;
}

// Here you can write the SQL to a file or just output it to the console
const sql = generateDescribeTableSQL();
console.log(sql);
// Optionally write to a file
// fs.writeFileSync('describe_table.sql', sql);