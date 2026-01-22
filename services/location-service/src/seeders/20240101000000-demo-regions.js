'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже регионы
    const existingRegionsResult = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM regions",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingRegions = Array.isArray(existingRegionsResult) ? existingRegionsResult[0] : existingRegionsResult;
    
    if (existingRegions && existingRegions.count > 0) {
      console.log('Regions already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert('regions', [
      { name: 'Московская область', nameEn: 'Moscow Oblast', code: 'MOS', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ленинградская область', nameEn: 'Leningrad Oblast', code: 'LEN', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Новосибирская область', nameEn: 'Novosibirsk Oblast', code: 'NVS', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Свердловская область', nameEn: 'Sverdlovsk Oblast', code: 'SVE', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Краснодарский край', nameEn: 'Krasnodar Krai', code: 'KDA', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Республика Татарстан', nameEn: 'Republic of Tatarstan', code: 'TA', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ростовская область', nameEn: 'Rostov Oblast', code: 'ROS', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Челябинская область', nameEn: 'Chelyabinsk Oblast', code: 'CHE', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Самарская область', nameEn: 'Samara Oblast', code: 'SAM', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Нижегородская область', nameEn: 'Nizhny Novgorod Oblast', code: 'NIZ', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Воронежская область', nameEn: 'Voronezh Oblast', code: 'VOR', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Красноярский край', nameEn: 'Krasnoyarsk Krai', code: 'KYA', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Пермский край', nameEn: 'Perm Krai', code: 'PER', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Волгоградская область', nameEn: 'Volgograd Oblast', code: 'VGG', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Саратовская область', nameEn: 'Saratov Oblast', code: 'SAR', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Омская область', nameEn: 'Omsk Oblast', code: 'OMS', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Тюменская область', nameEn: 'Tyumen Oblast', code: 'TYU', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Республика Башкортостан', nameEn: 'Republic of Bashkortostan', code: 'BA', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Удмуртская Республика', nameEn: 'Udmurt Republic', code: 'UD', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Белгородская область', nameEn: 'Belgorod Oblast', code: 'BEL', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('regions', null, {});
  },
};
