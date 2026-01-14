'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('buildings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Номер дома',
      },
      building: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Корпус/строение',
      },
      streetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'streets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID улицы',
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Широта',
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Долгота',
      },
      postalCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Почтовый индекс',
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

    await queryInterface.addIndex('buildings', ['streetId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('buildings');
  },
};
