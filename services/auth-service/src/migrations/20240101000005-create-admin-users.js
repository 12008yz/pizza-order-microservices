'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin_users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'operator'),
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Для операторов: компания/категория',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Создаем индекс для быстрого поиска по email
    await queryInterface.addIndex('admin_users', ['email'], {
      unique: true,
      name: 'admin_users_email_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('admin_users');
  },
};
