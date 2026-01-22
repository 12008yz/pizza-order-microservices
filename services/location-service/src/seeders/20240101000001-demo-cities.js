'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже города
    const existingCitiesResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM cities",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingCities = Array.isArray(existingCitiesResult) ? existingCitiesResult[0] : existingCitiesResult;

    if (existingCities && existingCities.count > 0) {
      console.log('Cities already exist, skipping seed');
      return;
    }

    // Получаем ID регионов
    const regions = await queryInterface.sequelize.query(
      "SELECT id, name, code FROM regions",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const regionMap = {};
    if (Array.isArray(regions)) {
      regions.forEach(r => {
        regionMap[r.code] = r.id;
      });
    }

    await queryInterface.bulkInsert('cities', [
      { name: 'Москва', nameEn: 'Moscow', regionId: regionMap['MOS'], latitude: 55.7558, longitude: 37.6173, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Санкт-Петербург', nameEn: 'Saint Petersburg', regionId: regionMap['LEN'], latitude: 59.9343, longitude: 30.3351, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Новосибирск', nameEn: 'Novosibirsk', regionId: regionMap['NVS'], latitude: 55.0084, longitude: 82.9357, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Екатеринбург', nameEn: 'Yekaterinburg', regionId: regionMap['SVE'], latitude: 56.8431, longitude: 60.6454, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Краснодар', nameEn: 'Krasnodar', regionId: regionMap['KDA'], latitude: 45.0355, longitude: 38.9753, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Казань', nameEn: 'Kazan', regionId: regionMap['TA'], latitude: 55.8304, longitude: 49.0661, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ростов-на-Дону', nameEn: 'Rostov-on-Don', regionId: regionMap['ROS'], latitude: 47.2357, longitude: 39.7015, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Челябинск', nameEn: 'Chelyabinsk', regionId: regionMap['CHE'], latitude: 55.1644, longitude: 61.4368, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Самара', nameEn: 'Samara', regionId: regionMap['SAM'], latitude: 53.2001, longitude: 50.15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Нижний Новгород', nameEn: 'Nizhny Novgorod', regionId: regionMap['NIZ'], latitude: 56.2965, longitude: 43.9361, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Воронеж', nameEn: 'Voronezh', regionId: regionMap['VOR'], latitude: 51.6720, longitude: 39.1843, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Красноярск', nameEn: 'Krasnoyarsk', regionId: regionMap['KYA'], latitude: 56.0184, longitude: 92.8672, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Пермь', nameEn: 'Perm', regionId: regionMap['PER'], latitude: 58.0105, longitude: 56.2502, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Волгоград', nameEn: 'Volgograd', regionId: regionMap['VGG'], latitude: 48.7194, longitude: 44.5018, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Саратов', nameEn: 'Saratov', regionId: regionMap['SAR'], latitude: 51.5336, longitude: 46.0342, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Омск', nameEn: 'Omsk', regionId: regionMap['OMS'], latitude: 54.9885, longitude: 73.3242, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Тюмень', nameEn: 'Tyumen', regionId: regionMap['TYU'], latitude: 57.1522, longitude: 65.5272, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Уфа', nameEn: 'Ufa', regionId: regionMap['BA'], latitude: 54.7431, longitude: 55.9678, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ижевск', nameEn: 'Izhevsk', regionId: regionMap['UD'], latitude: 56.8528, longitude: 53.2115, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Белгород', nameEn: 'Belgorod', regionId: regionMap['BEL'], latitude: 50.5957, longitude: 36.5873, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cities', null, {});
  },
};
