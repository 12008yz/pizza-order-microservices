'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Создаем ENUM тип для userType
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_refresh_tokens_userType" AS ENUM ('client', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Добавляем поле userType для различения клиентов и админов
    await queryInterface.addColumn('refresh_tokens', 'userType', {
      type: Sequelize.ENUM('client', 'admin'),
      allowNull: false,
      defaultValue: 'client',
    });

    // Удаляем Foreign Key constraint (пробуем разные возможные имена)
    try {
      await queryInterface.removeConstraint('refresh_tokens', 'refresh_tokens_userId_fkey');
    } catch (error) {
      // Пробуем альтернативное имя
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE refresh_tokens 
          DROP CONSTRAINT IF EXISTS refresh_tokens_userId_fkey;
        `);
      } catch (e) {
        // Игнорируем, если constraint уже удален или не существует
      }
    }

    // Обновляем существующие записи - все существующие токены относятся к клиентам
    await queryInterface.sequelize.query(`
      UPDATE refresh_tokens 
      SET "userType" = 'client' 
      WHERE "userType" IS NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Восстанавливаем Foreign Key constraint
    await queryInterface.addConstraint('refresh_tokens', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'refresh_tokens_userId_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Удаляем поле userType
    await queryInterface.removeColumn('refresh_tokens', 'userType');
    
    // Удаляем ENUM тип
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_refresh_tokens_userType";
    `);
  },
};
