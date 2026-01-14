'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем новые поля для ID адресов
    await queryInterface.addColumn('applications', 'regionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID региона (связь через внешний API Location Service)',
    });

    await queryInterface.addColumn('applications', 'cityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID города (связь через внешний API Location Service)',
    });

    await queryInterface.addColumn('applications', 'streetId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID улицы (связь через внешний API Location Service)',
    });

    await queryInterface.addColumn('applications', 'buildingId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID дома (связь через внешний API Location Service)',
    });

    await queryInterface.addColumn('applications', 'apartmentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID квартиры (связь через внешний API Location Service)',
    });

    await queryInterface.addColumn('applications', 'addressString', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Полный адрес строкой (для отображения)',
    });

    // Добавляем индексы для новых полей
    await queryInterface.addIndex('applications', ['regionId']);
    await queryInterface.addIndex('applications', ['cityId']);
    await queryInterface.addIndex('applications', ['streetId']);
    await queryInterface.addIndex('applications', ['buildingId']);
    await queryInterface.addIndex('applications', ['apartmentId']);

    // Старые поля (city, street, house, building, apartment) оставляем для обратной совместимости
    // Их можно будет удалить позже, когда все данные будут мигрированы
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('applications', ['regionId']);
    await queryInterface.removeIndex('applications', ['cityId']);
    await queryInterface.removeIndex('applications', ['streetId']);
    await queryInterface.removeIndex('applications', ['buildingId']);
    await queryInterface.removeIndex('applications', ['apartmentId']);

    // Удаляем колонки
    await queryInterface.removeColumn('applications', 'regionId');
    await queryInterface.removeColumn('applications', 'cityId');
    await queryInterface.removeColumn('applications', 'streetId');
    await queryInterface.removeColumn('applications', 'buildingId');
    await queryInterface.removeColumn('applications', 'apartmentId');
    await queryInterface.removeColumn('applications', 'addressString');
  },
};
