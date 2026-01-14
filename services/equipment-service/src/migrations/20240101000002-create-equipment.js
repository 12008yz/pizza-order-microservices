'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
        comment: 'ID провайдера (связь через внешний API)',
      },
      equipmentTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'equipment_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Цена покупки (null = не продается)',
      },
      installmentMonths: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Рассрочка на N месяцев (null = рассрочка недоступна)',
      },
      rentalMonthlyPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Ежемесячная арендная плата (null = аренда недоступна)',
      },
      setupPrice: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
        comment: 'Стоимость установки/настройки',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Индексы для оптимизации запросов
    await queryInterface.addIndex('equipment', ['providerId']);
    await queryInterface.addIndex('equipment', ['equipmentTypeId']);
    await queryInterface.addIndex('equipment', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('equipment');
  },
};
