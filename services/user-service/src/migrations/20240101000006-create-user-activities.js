'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_activities', {
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
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Детали действия (может быть JSON)',
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_activities', ['userId', 'createdAt']);
    await queryInterface.addIndex('user_activities', ['phone', 'createdAt']);
    await queryInterface.addIndex('user_activities', ['action']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_activities');
  },
};
