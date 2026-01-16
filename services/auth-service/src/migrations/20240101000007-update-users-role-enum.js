'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Удаляем значение 'admin' из ENUM, оставляем только 'user'
    // Это делается через создание нового типа и изменение колонки
    await queryInterface.sequelize.query(`
      -- Сначала обновляем все записи с role='admin' на role='user'
      UPDATE users SET role = 'user'::text::enum_users_role WHERE role::text = 'admin';
    `).catch(() => {
      // Если enum_users_role не существует, пробуем users_role
      return queryInterface.sequelize.query(`
        UPDATE users SET role = 'user'::text::users_role WHERE role::text = 'admin';
      `);
    });

    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Удаляем DEFAULT значение
        ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
        
        -- Удаляем старый тип если существует
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_new') THEN
            DROP TYPE users_role_new CASCADE;
        END IF;
        
        -- Создаем новый тип ENUM только с 'user'
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
    `).catch(async (error) => {
      // Если тип уже существует или есть другие проблемы, пробуем другой подход
      console.log('Trying alternative approach for role enum update...');
      
      // Просто обновляем все записи с role='admin' на role='user' (на случай если они остались)
      await queryInterface.sequelize.query(`
        UPDATE users SET role = 'user'::text::enum_users_role WHERE role::text = 'admin';
      `).catch(() => {
        return queryInterface.sequelize.query(`
          UPDATE users SET role = 'user'::text::users_role WHERE role::text = 'admin';
        `);
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Возвращаем обратно 'admin' в ENUM
    await queryInterface.sequelize.query(`
      -- Создаем тип с обоими значениями
      CREATE TYPE users_role_old AS ENUM ('user', 'admin');
      
      -- Изменяем колонку обратно
      ALTER TABLE users 
        ALTER COLUMN role TYPE users_role_old 
        USING (role::text::users_role_old);
      
      -- Удаляем новый тип
      DROP TYPE IF EXISTS users_role;
      
      -- Переименовываем
      ALTER TYPE users_role_old RENAME TO users_role;
    `);
  },
};
