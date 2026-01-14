'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('regions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Название региона',
      },
      nameEn: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Название региона на английском',
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Код региона',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('regions');
  },
};
