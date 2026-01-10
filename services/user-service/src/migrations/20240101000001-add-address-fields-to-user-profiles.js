'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_profiles', 'street', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'house', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'building', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'apartment', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'currentProviderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'currentTariffName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_profiles', 'savedAddresses', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_profiles', 'street');
    await queryInterface.removeColumn('user_profiles', 'house');
    await queryInterface.removeColumn('user_profiles', 'building');
    await queryInterface.removeColumn('user_profiles', 'apartment');
    await queryInterface.removeColumn('user_profiles', 'currentProviderId');
    await queryInterface.removeColumn('user_profiles', 'currentTariffName');
    await queryInterface.removeColumn('user_profiles', 'savedAddresses');
  },
};


