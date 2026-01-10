'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Получаем ID провайдеров
    const providers = await queryInterface.sequelize.query(
      "SELECT id, slug FROM providers",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const providerMap = {};
    providers.forEach(p => {
      providerMap[p.slug] = p.id;
    });

    await queryInterface.bulkInsert('coverage', [
      // Ростелеком - Москва
      {
        providerId: providerMap['rostelecom'],
        city: 'Москва',
        district: 'Центральный',
        street: 'Тверская',
        houseFrom: 1,
        houseTo: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        providerId: providerMap['rostelecom'],
        city: 'Москва',
        district: 'Центральный',
        street: 'Арбат',
        houseFrom: 1,
        houseTo: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // МТС - Москва
      {
        providerId: providerMap['mts'],
        city: 'Москва',
        district: 'Центральный',
        street: 'Тверская',
        houseFrom: 1,
        houseTo: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        providerId: providerMap['mts'],
        city: 'Москва',
        district: 'Северный',
        street: 'Ленинградский проспект',
        houseFrom: 1,
        houseTo: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Билайн - Москва
      {
        providerId: providerMap['beeline'],
        city: 'Москва',
        district: 'Центральный',
        street: 'Тверская',
        houseFrom: 1,
        houseTo: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Дом.ру - Москва
      {
        providerId: providerMap['domru'],
        city: 'Москва',
        district: 'Центральный',
        street: 'Тверская',
        houseFrom: 1,
        houseTo: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        providerId: providerMap['domru'],
        city: 'Москва',
        district: 'Южный',
        street: 'Варшавское шоссе',
        houseFrom: 1,
        houseTo: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('coverage', {}, {});
  },
};


