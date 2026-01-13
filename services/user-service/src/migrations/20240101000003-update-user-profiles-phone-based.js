'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Изменить userId на nullable (для обычных пользователей)
    // Сначала удаляем unique constraint на userId, если он есть
    try {
      // Пытаемся найти и удалить constraint
      const [results] = await queryInterface.sequelize.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_profiles' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%user_id%'
      `);
      
      if (results && results.length > 0) {
        for (const result of results) {
          await queryInterface.removeConstraint('user_profiles', result.constraint_name);
        }
      }
    } catch (e) {
      // Constraint может не существовать или иметь другое имя
    }

    await queryInterface.changeColumn('user_profiles', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      // Не добавляем unique здесь, так как несколько NULL значений разрешены
    });

    // Изменить phone на обязательный и unique
    // Сначала удаляем unique constraint если есть
    try {
      await queryInterface.removeConstraint('user_profiles', 'user_profiles_phone_key');
    } catch (e) {
      // Constraint может не существовать
    }

    // Удаляем записи без телефона (если есть) перед изменением на NOT NULL
    await queryInterface.sequelize.query(
      "DELETE FROM user_profiles WHERE phone IS NULL OR phone = '';"
    );

    // Изменяем phone на NOT NULL и добавляем unique
    await queryInterface.changeColumn('user_profiles', 'phone', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    // Добавляем индекс на phone для быстрого поиска
    await queryInterface.addIndex('user_profiles', ['phone'], {
      unique: true,
      name: 'user_profiles_phone_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Откат изменений
    await queryInterface.changeColumn('user_profiles', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('user_profiles', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });

    try {
      await queryInterface.removeIndex('user_profiles', 'user_profiles_phone_unique');
    } catch (e) {
      // Index может не существовать
    }
  },
};
