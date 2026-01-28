'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_sensitive_data', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Нормализованный телефон пользователя, основной идентификатор записи',
      },
      passportDataEnc: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Зашифрованные паспортные данные (серия, номер, дата выдачи и т.п.)',
      },
      snilsEnc: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Зашифрованный СНИЛС',
      },
      innEnc: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Зашифрованный ИНН',
      },
      extraEnc: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Зашифрованные дополнительные данные (например, JSON с любыми ПДн)',
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_sensitive_data');
  },
};

