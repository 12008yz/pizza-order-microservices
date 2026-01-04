'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tariffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('new', 'processing', 'contacted', 'scheduled', 'connected', 'cancelled', 'rejected'),
        defaultValue: 'new',
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      house: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      building: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apartment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      entrance: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      floor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      intercom: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferredDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      preferredTimeFrom: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferredTimeTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      utmSource: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      utmMedium: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      utmCampaign: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      utmContent: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      utmTerm: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      assignedTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      internalComment: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('applications', ['userId']);
    await queryInterface.addIndex('applications', ['tariffId']);
    await queryInterface.addIndex('applications', ['providerId']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('applications');
  },
};

