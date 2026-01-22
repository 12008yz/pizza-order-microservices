'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже улицы
    const existingStreetsResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM streets",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingStreets = Array.isArray(existingStreetsResult) ? existingStreetsResult[0] : existingStreetsResult;
    
    if (existingStreets && existingStreets.count > 0) {
      console.log('Streets already exist, skipping seed');
      return;
    }

    // Получаем города и типы улиц
    const cities = await queryInterface.sequelize.query(
      "SELECT id, name FROM cities",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const streetTypes = await queryInterface.sequelize.query(
      "SELECT id, name, \"shortName\" FROM street_types",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const cityMap = {};
    if (Array.isArray(cities)) {
      cities.forEach(c => {
        cityMap[c.name] = c.id;
      });
    }

    const typeMap = {};
    if (Array.isArray(streetTypes)) {
      streetTypes.forEach(t => {
        typeMap[t.name] = t.id;
      });
    }

    const streets = [];
    
    // Москва - 20 улиц, включая бульвары
    if (cityMap['Москва']) {
      streets.push(
        { name: 'Тверская', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7558, longitude: 37.6173, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Арбат', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7520, longitude: 37.5915, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Ленинградский', cityId: cityMap['Москва'], streetTypeId: typeMap['проспект'], latitude: 55.7896, longitude: 37.5447, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Тверской', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7588, longitude: 37.6042, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Гоголевский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7520, longitude: 37.6000, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Никитский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7550, longitude: 37.6050, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Сретенский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7650, longitude: 37.6350, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Петровский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7700, longitude: 37.6150, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Рождественский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7600, longitude: 37.6250, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Яузский', cityId: cityMap['Москва'], streetTypeId: typeMap['бульвар'], latitude: 55.7500, longitude: 37.6400, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Покровка', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7550, longitude: 37.6500, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Мясницкая', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7600, longitude: 37.6300, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Кузнецкий Мост', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7610, longitude: 37.6200, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Неглинная', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7580, longitude: 37.6250, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Охотный Ряд', cityId: cityMap['Москва'], streetTypeId: typeMap['улица'], latitude: 55.7570, longitude: 37.6150, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Красная', cityId: cityMap['Москва'], streetTypeId: typeMap['площадь'], latitude: 55.7539, longitude: 37.6208, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Москворецкая', cityId: cityMap['Москва'], streetTypeId: typeMap['набережная'], latitude: 55.7500, longitude: 37.6300, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Кремлевская', cityId: cityMap['Москва'], streetTypeId: typeMap['набережная'], latitude: 55.7520, longitude: 37.6150, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Ленинградское', cityId: cityMap['Москва'], streetTypeId: typeMap['шоссе'], latitude: 55.8000, longitude: 37.5000, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Волоколамское', cityId: cityMap['Москва'], streetTypeId: typeMap['шоссе'], latitude: 55.8200, longitude: 37.4800, createdAt: new Date(), updatedAt: new Date() }
      );
    }

    // Если есть другие города, добавляем улицы для них тоже
    if (cityMap['Санкт-Петербург']) {
      streets.push(
        { name: 'Невский', cityId: cityMap['Санкт-Петербург'], streetTypeId: typeMap['проспект'], latitude: 59.9343, longitude: 30.3351, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Лиговский', cityId: cityMap['Санкт-Петербург'], streetTypeId: typeMap['проспект'], latitude: 59.9200, longitude: 30.3500, createdAt: new Date(), updatedAt: new Date() }
      );
    }

    if (streets.length > 0) {
      await queryInterface.bulkInsert('streets', streets);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('streets', null, {});
  },
};
