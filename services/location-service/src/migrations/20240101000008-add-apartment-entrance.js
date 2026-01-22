'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем поле подъезда для квартиры
    await queryInterface.addColumn('apartments', 'entrance', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Номер подъезда',
    });

    await queryInterface.addIndex('apartments', ['entrance']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('apartments', ['entrance']);
    await queryInterface.removeColumn('apartments', 'entrance');
  },
};
