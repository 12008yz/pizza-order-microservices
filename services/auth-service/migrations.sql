-- Миграция 1: Создание таблицы admin_users
CREATE TYPE admin_users_role AS ENUM ('admin', 'operator');

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role admin_users_role NOT NULL,
    department VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique ON admin_users(email);

-- Миграция 2: Перенос существующих админов из users в admin_users
INSERT INTO admin_users (email, password, name, role, "isActive", "createdAt", "updatedAt")
SELECT 
    email, 
    password, 
    COALESCE(name, 'Admin') as name,
    'admin'::admin_users_role as role,
    true as "isActive",
    "createdAt",
    "updatedAt"
FROM users
WHERE role::text = 'admin' 
    AND email IS NOT NULL 
    AND password IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM admin_users WHERE admin_users.email = users.email
    );

-- Миграция 3: Обновление ENUM role в users (удаление 'admin')
-- Сначала обновляем все записи с role='admin' на role='user'
-- Используем текущий тип (может быть enum_users_role или users_role)
DO $$ 
BEGIN
    -- Обновляем все записи с role='admin' на role='user'
    UPDATE users SET role = 'user'::text::enum_users_role WHERE role::text = 'admin';
    
    -- Если тип enum_users_role не найден, пробуем users_role
    EXCEPTION WHEN OTHERS THEN
        UPDATE users SET role = 'user'::text::users_role WHERE role::text = 'admin';
END $$;

-- Затем обновляем ENUM тип
DO $$ 
BEGIN
    -- Удаляем DEFAULT значение
    ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
    
    -- Создаем новый тип ENUM только с 'user'
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_new') THEN
        DROP TYPE users_role_new CASCADE;
    END IF;
    
    CREATE TYPE users_role_new AS ENUM ('user');
    
    -- Изменяем колонку role на новый тип
    ALTER TABLE users 
        ALTER COLUMN role TYPE users_role_new 
        USING (role::text::users_role_new);
    
    -- Возвращаем DEFAULT значение
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::users_role_new;
    
    -- Удаляем старый тип (может быть enum_users_role или users_role)
    DROP TYPE IF EXISTS enum_users_role CASCADE;
    DROP TYPE IF EXISTS users_role CASCADE;
    
    -- Переименовываем новый тип в старое имя
    ALTER TYPE users_role_new RENAME TO users_role;
END $$;

-- Добавляем запись в SequelizeMeta для отслеживания миграций
INSERT INTO "SequelizeMeta" (name) VALUES 
    ('20240101000005-create-admin-users.js'),
    ('20240101000006-migrate-admins-to-admin-users.js'),
    ('20240101000007-update-users-role-enum.js')
ON CONFLICT (name) DO NOTHING;
