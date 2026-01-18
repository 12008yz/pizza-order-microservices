'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('availability_cache', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      addressHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Хеш адреса для быстрого поиска',
      },
      availableProviders: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'JSON строка с массивом ID провайдеров',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Время истечения кеша',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Индексы
    await queryInterface.addIndex('availability_cache', ['addressHash'], {
      unique: true,
    });
    await queryInterface.addIndex('availability_cache', ['expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('availability_cache');
  },
};
