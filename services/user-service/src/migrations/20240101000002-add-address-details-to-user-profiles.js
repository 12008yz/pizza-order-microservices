'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_profiles', 'entrance', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Подъезд',
    });
    await queryInterface.addColumn('user_profiles', 'floor', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Этаж',
    });
    await queryInterface.addColumn('user_profiles', 'intercomCode', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Код домофона',
    });
    await queryInterface.addColumn('user_profiles', 'addressComment', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Комментарий к адресу (например, "может пользователь сам встретит", "ключи спрятаны" и т.д.)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_profiles', 'entrance');
    await queryInterface.removeColumn('user_profiles', 'floor');
    await queryInterface.removeColumn('user_profiles', 'intercomCode');
    await queryInterface.removeColumn('user_profiles', 'addressComment');
  },
};
