'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tariffs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      speed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      connectionPrice: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      technology: {
        type: Sequelize.ENUM('fiber', 'dsl', 'cable', 'wireless', 'mobile'),
        allowNull: false,
      },
      hasTV: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tvChannels: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      hasMobile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      mobileMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mobileGB: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mobileSMS: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      promoPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      promoMonths: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addIndex('tariffs', ['providerId']);
    await queryInterface.addIndex('tariffs', ['isActive']);
    await queryInterface.addIndex('tariffs', ['speed']);
    await queryInterface.addIndex('tariffs', ['price']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tariffs');
  },
};


