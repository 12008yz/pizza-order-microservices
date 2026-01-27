'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже квартиры
    const existingApartmentsResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM apartments",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingApartments = Array.isArray(existingApartmentsResult) ? existingApartmentsResult[0] : existingApartmentsResult;

    if (existingApartments && existingApartments.count > 0) {
      console.log('Apartments already exist, skipping seed');
      return;
    }

    // Получаем дома
    const buildings = await queryInterface.sequelize.query(
      "SELECT id, number FROM buildings LIMIT 20",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(buildings) || buildings.length === 0) {
      console.log('No buildings found, skipping apartments seed');
      return;
    }

    const apartments = [];

    // Для каждого дома создаем несколько квартир (2, 3, 4, 5 и т.д.)
    buildings.forEach((building, buildingIndex) => {
      // Создаем от 4 до 10 квартир для каждого дома
      const apartmentsCount = 4 + (buildingIndex % 7); // От 4 до 10 квартир
      
      for (let aptNum = 2; aptNum <= apartmentsCount + 1; aptNum++) {
        apartments.push({
          number: aptNum.toString(),
          buildingId: building.id,
          floor: ((aptNum - 2) % 5) + 1, // Этаж от 1 до 5
          entrance: Math.floor((aptNum - 2) / 5) + 1, // Подъезд
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    if (apartments.length > 0) {
      await queryInterface.bulkInsert('apartments', apartments.slice(0, 20));
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('apartments', null, {});
  },
};
