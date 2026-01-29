'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM equipment_types WHERE slug = 'router' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log('Equipment types already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert('equipment_types', [
      {
        name: 'Роутер',
        slug: 'router',
        description: 'Wi‑Fi роутер для домашнего интернета',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ТВ-приставка',
        slug: 'tv-set-top',
        description: 'Приставка для цифрового ТВ',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'SIM-карта',
        slug: 'sim-card',
        description: 'SIM-карта для мобильной связи',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(
      'equipment_types',
      { slug: { [Op.in]: ['router', 'tv-set-top', 'sim-card'] } },
      {}
    );
  },
};
