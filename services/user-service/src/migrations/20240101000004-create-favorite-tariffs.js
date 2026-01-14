'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorite_tariffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Для авторизованных пользователей',
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Для неавторизованных (идентификация по телефону)',
      },
      tariffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID тарифа (связь через внешний API Provider Service)',
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID провайдера (связь через внешний API Provider Service)',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('favorite_tariffs', ['userId']);
    await queryInterface.addIndex('favorite_tariffs', ['phone']);
    await queryInterface.addIndex('favorite_tariffs', ['tariffId']);
    await queryInterface.addIndex('favorite_tariffs', ['providerId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('favorite_tariffs');
  },
};
