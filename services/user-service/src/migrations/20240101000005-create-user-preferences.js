'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_preferences', {
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
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Значение настройки (может быть JSON)',
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

    await queryInterface.addIndex('user_preferences', ['userId']);
    await queryInterface.addIndex('user_preferences', ['phone']);
    await queryInterface.addIndex('user_preferences', ['key']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_preferences');
  },
};
