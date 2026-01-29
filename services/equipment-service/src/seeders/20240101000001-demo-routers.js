'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [routerType] = await queryInterface.sequelize.query(
      "SELECT id FROM equipment_types WHERE slug = 'router' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!routerType) {
      console.log('Equipment type "router" not found. Run seed 20240101000000-demo-equipment-types first.');
      return;
    }

    const routerTypeId = routerType.id;

    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM equipment WHERE equipmentTypeId = :routerTypeId LIMIT 1",
      { replacements: { routerTypeId }, type: Sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log('Routers already exist, skipping seed');
      return;
    }

    const now = new Date();

    // providerId соответствует провайдерам из provider-service: 1=Ростелеком, 2=МТС, 3=Билайн, 4=Мегафон, 5=ДОМ.RU
    const routers = [
      {
        name: 'Роутер Wi‑Fi 6 Ростелеком',
        description: 'Двухдиапазонный Wi‑Fi 6, гигабитные порты, простая настройка через приложение.',
        providerId: 1,
        equipmentTypeId: routerTypeId,
        purchasePrice: 3990,
        installmentMonths: 12,
        rentalMonthlyPrice: 99,
        setupPrice: 0,
        isActive: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Роутер МТС GPON',
        description: 'Роутер для подключения по технологии GPON, Wi‑Fi 5, 4 LAN-порта.',
        providerId: 2,
        equipmentTypeId: routerTypeId,
        purchasePrice: 2990,
        installmentMonths: 6,
        rentalMonthlyPrice: 149,
        setupPrice: 0,
        isActive: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Билайн Роутер Pro',
        description: 'Wi‑Fi 6, зона покрытия до 100 м², родительский контроль и гостевой Wi‑Fi.',
        providerId: 3,
        equipmentTypeId: routerTypeId,
        purchasePrice: 4490,
        installmentMonths: 12,
        rentalMonthlyPrice: 199,
        setupPrice: 500,
        isActive: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Мегафон Домашний роутер',
        description: 'Двухдиапазонный роутер для домашнего интернета, USB для принтера и накопителей.',
        providerId: 4,
        equipmentTypeId: routerTypeId,
        purchasePrice: 3490,
        installmentMonths: 12,
        rentalMonthlyPrice: 129,
        setupPrice: 0,
        isActive: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'ДОМ.RU Wi‑Fi роутер',
        description: 'Роутер для тарифов ДОМ.RU, Wi‑Fi 5, удобное приложение для управления.',
        providerId: 5,
        equipmentTypeId: routerTypeId,
        purchasePrice: 2490,
        installmentMonths: 6,
        rentalMonthlyPrice: 99,
        setupPrice: 0,
        isActive: true,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('equipment', routers);
  },

  async down(queryInterface, Sequelize) {
    const [routerType] = await queryInterface.sequelize.query(
      "SELECT id FROM equipment_types WHERE slug = 'router' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (routerType) {
      await queryInterface.bulkDelete('equipment', { equipmentTypeId: routerType.id }, {});
    }
  },
};
