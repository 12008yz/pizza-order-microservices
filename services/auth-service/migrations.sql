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
UPDATE users SET role = 'user'::enum_users_role WHERE role::text = 'admin';

-- Затем обновляем ENUM тип (если нужно)
-- Проверяем текущий тип ENUM
DO $$ 
BEGIN
    -- Если тип enum_users_role содержит 'admin', нужно его обновить
    -- Но так как мы уже обновили все записи, просто проверяем что все хорошо
    IF EXISTS (SELECT 1 FROM users WHERE role::text = 'admin') THEN
        RAISE NOTICE 'Есть записи с role=admin, обновляем на user';
        UPDATE users SET role = 'user'::enum_users_role WHERE role::text = 'admin';
    END IF;
END $$;

-- Добавляем запись в SequelizeMeta для отслеживания миграций
INSERT INTO "SequelizeMeta" (name) VALUES 
    ('20240101000005-create-admin-users.js'),
    ('20240101000006-migrate-admins-to-admin-users.js'),
    ('20240101000007-update-users-role-enum.js')
ON CONFLICT (name) DO NOTHING;
