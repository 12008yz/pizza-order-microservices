'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже типы улиц
    const existingTypesResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM street_types",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingTypes = Array.isArray(existingTypesResult) ? existingTypesResult[0] : existingTypesResult;
    
    if (existingTypes && existingTypes.count > 0) {
      console.log('Street types already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert('street_types', [
      { name: 'улица', shortName: 'ул.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'проспект', shortName: 'пр.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'переулок', shortName: 'пер.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'бульвар', shortName: 'бул.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'площадь', shortName: 'пл.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'набережная', shortName: 'наб.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'шоссе', shortName: 'ш.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'тупик', shortName: 'туп.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'аллея', shortName: 'ал.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'проезд', shortName: 'пр-д', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('street_types', null, {});
  },
};
