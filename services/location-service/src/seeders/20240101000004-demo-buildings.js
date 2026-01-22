'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже дома
    const existingBuildingsResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM buildings",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingBuildings = Array.isArray(existingBuildingsResult) ? existingBuildingsResult[0] : existingBuildingsResult;
    
    if (existingBuildings && existingBuildings.count > 0) {
      console.log('Buildings already exist, skipping seed');
      return;
    }

    // Получаем улицы
    const streets = await queryInterface.sequelize.query(
      "SELECT id, name FROM streets LIMIT 20",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(streets) || streets.length === 0) {
      console.log('No streets found, skipping buildings seed');
      return;
    }

    const buildings = [];
    
    // Для каждой улицы создаем несколько домов
    streets.forEach((street, index) => {
      for (let i = 1; i <= 2; i++) {
        const houseNumber = (index * 2 + i).toString();
        // Добавляем структуру дома: 5 подъездов, 10 этажей, 1 квартира на этаж
        buildings.push({
          number: houseNumber,
          building: i === 2 ? 'к.1' : null, // Каждый второй дом с корпусом
          streetId: street.id,
          entrances: 5, // 5 подъездов
          floors: 10, // 10 этажей
          apartmentsPerFloor: 1, // 1 квартира на этаж в каждом подъезде
          postalCode: `10${1000 + index * 2 + i}`,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    // Добавляем еще домов до 20
    if (buildings.length < 20 && streets.length > 0) {
      const firstStreet = streets[0];
      for (let i = buildings.length + 1; i <= 20; i++) {
        // Разнообразная структура домов
        const entrances = (i % 5) + 3; // От 3 до 7 подъездов
        const floors = (i % 9) + 5; // От 5 до 13 этажей
        const apartmentsPerFloor = (i % 3) + 1; // От 1 до 3 квартир на этаж
        buildings.push({
          number: i.toString(),
          building: i % 3 === 0 ? `стр.${Math.floor(i / 3)}` : null,
          streetId: firstStreet.id,
          entrances,
          floors,
          apartmentsPerFloor,
          postalCode: `10${1000 + i}`,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (buildings.length > 0) {
      await queryInterface.bulkInsert('buildings', buildings.slice(0, 20));
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('buildings', null, {});
  },
};
