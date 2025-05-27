-- Primero eliminamos las restricciones de clave foránea
ALTER TABLE battleresult
DROP FOREIGN KEY IF EXISTS FKijqbuk6cx84waroscms7jjhxo,
DROP FOREIGN KEY IF EXISTS FK_user2_id,
DROP FOREIGN KEY IF EXISTS FK_winner_id;

-- Luego eliminamos los índices
ALTER TABLE battleresult
DROP INDEX IF EXISTS FKijqbuk6cx84waroscms7jjhxo,
DROP INDEX IF EXISTS FK_user2_id,
DROP INDEX IF EXISTS FK_winner_id;

-- Finalmente eliminamos las columnas
ALTER TABLE battleresult
DROP COLUMN IF EXISTS user1_id,
DROP COLUMN IF EXISTS user2_id,
DROP COLUMN IF EXISTS winner_id; 