'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('applications', 'routerNeed', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Нужен ли роутер: need, from_operator, own, no_thanks',
    });
    await queryInterface.addColumn('applications', 'routerPurchase', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Способ получения: buy, installment, rent',
    });
    await queryInterface.addColumn('applications', 'routerOperator', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Оператор роутера: beeline, domru, megafon, mts, rostelecom',
    });
    await queryInterface.addColumn('applications', 'routerConfig', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Настройка: no_config, with_config',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('applications', 'routerNeed');
    await queryInterface.removeColumn('applications', 'routerPurchase');
    await queryInterface.removeColumn('applications', 'routerOperator');
    await queryInterface.removeColumn('applications', 'routerConfig');
  },
};
