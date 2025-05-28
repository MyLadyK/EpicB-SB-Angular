-- Mostrar las restricciones de clave foránea de la tabla battleresult
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_NAME = 'battleresult'
    AND REFERENCED_TABLE_NAME IS NOT NULL; 