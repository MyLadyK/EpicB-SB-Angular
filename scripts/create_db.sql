-- Script para crear la base de datos y usuario para Epic Battle

-- Ejecuta esto en MySQL Workbench o en tu cliente favorito

CREATE DATABASE IF NOT EXISTS epicb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Si quieres crear un usuario específico para la app, descomenta y ajusta:
-- CREATE USER 'epicb_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
-- GRANT ALL PRIVILEGES ON epicb_db.* TO 'epicb_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Si usas root, no necesitas crear usuario, solo asegúrate de tener la base de datos creada.
