'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('technical_access', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      buildingId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID дома из Location Service',
      },
      apartmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID квартиры из Location Service',
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID провайдера',
      },
      connectionType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'fiber',
        comment: 'Тип подключения: fiber, cable, dsl, wireless',
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Индексы для быстрого поиска
    await queryInterface.addIndex('technical_access', ['buildingId']);
    await queryInterface.addIndex('technical_access', ['apartmentId']);
    await queryInterface.addIndex('technical_access', ['providerId']);
    await queryInterface.addIndex('technical_access', ['isAvailable']);
    
    // Составной индекс для быстрого поиска по buildingId + providerId
    await queryInterface.addIndex('technical_access', ['buildingId', 'providerId', 'isAvailable'], {
      name: 'technical_access_building_provider_idx',
    });
    
    // Составной индекс для быстрого поиска по apartmentId + providerId
    await queryInterface.addIndex('technical_access', ['apartmentId', 'providerId', 'isAvailable'], {
      name: 'technical_access_apartment_provider_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('technical_access');
  },
};
