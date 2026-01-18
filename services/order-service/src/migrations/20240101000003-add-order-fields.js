'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем новые поля в таблицу applications
    await queryInterface.addColumn('applications', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'citizenship', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'routerOption', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'routerPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'tvSettopOption', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'tvSettopPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'simCardOption', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'simCardPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'totalMonthlyPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'totalConnectionPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('applications', 'totalEquipmentPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('applications', 'firstName');
    await queryInterface.removeColumn('applications', 'lastName');
    await queryInterface.removeColumn('applications', 'dateOfBirth');
    await queryInterface.removeColumn('applications', 'citizenship');
    await queryInterface.removeColumn('applications', 'routerOption');
    await queryInterface.removeColumn('applications', 'routerPrice');
    await queryInterface.removeColumn('applications', 'tvSettopOption');
    await queryInterface.removeColumn('applications', 'tvSettopPrice');
    await queryInterface.removeColumn('applications', 'simCardOption');
    await queryInterface.removeColumn('applications', 'simCardPrice');
    await queryInterface.removeColumn('applications', 'totalMonthlyPrice');
    await queryInterface.removeColumn('applications', 'totalConnectionPrice');
    await queryInterface.removeColumn('applications', 'totalEquipmentPrice');
  },
};
