'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_profiles', 'connectionType', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Тип подключения: apartment, private, office',
    });
    await queryInterface.addColumn('user_profiles', 'contactMethod', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Метод связи: max, telegram, phone',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_profiles', 'connectionType');
    await queryInterface.removeColumn('user_profiles', 'contactMethod');
  },
};
