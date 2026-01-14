'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('street_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Полное название типа улицы',
      },
      shortName: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Сокращенное название',
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

    // Добавляем базовые типы улиц
    await queryInterface.bulkInsert('street_types', [
      { name: 'улица', shortName: 'ул.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'проспект', shortName: 'пр.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'переулок', shortName: 'пер.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'бульвар', shortName: 'бул.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'площадь', shortName: 'пл.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'набережная', shortName: 'наб.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'шоссе', shortName: 'ш.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'тупик', shortName: 'туп.', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('street_types');
  },
};
