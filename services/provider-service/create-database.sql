-- SQL скрипт для создания базы данных и пользователя для provider-service
-- Запустите этот скрипт в PostgreSQL (через psql или pgAdmin)

-- Создание пользователя (если не существует)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'provider_user') THEN
    CREATE USER provider_user WITH PASSWORD 'provider_password';
  END IF;
END
$$;

-- Создание базы данных (если не существует)
SELECT 'CREATE DATABASE provider_db OWNER provider_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'provider_db')\gexec

-- Предоставление прав пользователю
GRANT ALL PRIVILEGES ON DATABASE provider_db TO provider_user;

-- Подключение к базе данных и предоставление прав на схему
\c provider_db

GRANT ALL ON SCHEMA public TO provider_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO provider_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO provider_user;
