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

    // Для каждого дома создаем по 1-2 квартиры
    buildings.forEach((building, index) => {
      const apartmentNumber = (index + 1).toString();
      apartments.push({
        number: apartmentNumber,
        buildingId: building.id,
        floor: (index % 5) + 1, // Этаж от 1 до 5
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Для некоторых домов добавляем вторую квартиру
      if (index % 2 === 0 && apartments.length < 20) {
        apartments.push({
          number: `${apartmentNumber}А`,
          buildingId: building.id,
          floor: (index % 5) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    // Добавляем еще квартир до 20
    if (apartments.length < 20 && buildings.length > 0) {
      const firstBuilding = buildings[0];
      for (let i = apartments.length + 1; i <= 20; i++) {
        apartments.push({
          number: i.toString(),
          buildingId: firstBuilding.id,
          floor: (i % 9) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (apartments.length > 0) {
      await queryInterface.bulkInsert('apartments', apartments.slice(0, 20));
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('apartments', null, {});
  },
};
