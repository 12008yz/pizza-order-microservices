'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем поля структуры дома
    await queryInterface.addColumn('buildings', 'entrances', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Количество подъездов',
    });

    await queryInterface.addColumn('buildings', 'floors', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Количество этажей',
    });

    await queryInterface.addColumn('buildings', 'apartmentsPerFloor', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Количество квартир на этаже в одном подъезде',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('buildings', 'entrances');
    await queryInterface.removeColumn('buildings', 'floors');
    await queryInterface.removeColumn('buildings', 'apartmentsPerFloor');
  },
};
