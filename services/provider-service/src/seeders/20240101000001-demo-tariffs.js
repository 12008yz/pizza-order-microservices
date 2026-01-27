'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Очищаем старые тарифы перед добавлением новых (чтобы избежать дубликатов)
    await queryInterface.bulkDelete('tariffs', {}, {});

    // Получаем ID провайдеров (предполагаем, что они уже созданы)
    const providers = await queryInterface.sequelize.query(
      "SELECT id, slug FROM providers",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const providerMap = {};
    providers.forEach(p => {
      providerMap[p.slug] = p.id;
    });

    await queryInterface.bulkInsert('tariffs', [
      // Ростелеком - Технологии выгоды. Тест-драйв.
      {
        name: 'Технологии выгоды. Тест-драйв.',
        description: 'Интернет 100 Мбит/с + ТВ 135 каналов + мобильная связь',
        providerId: providerMap['rostelecom'],
        speed: 100,
        price: 965,
        connectionPrice: 500,
        technology: 'fiber',
        hasTV: true,
        tvChannels: 135,
        hasMobile: true,
        mobileMinutes: 1000,
        mobileGB: 40,
        mobileSMS: 50,
        promoPrice: 0,
        promoMonths: 3,
        promoText: '90 дней за 0 р.',
        favoriteLabel: 'Кинотеатр «Wink»',
        favoriteDesc: 'Дополнительное приложение',
        popularity: 95,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // МТС - Домашний интернет + ТВ
      {
        name: 'Домашний интернет + ТВ',
        description: 'Интернет 200 Мбит/с + ТВ 180 каналов + мобильная связь',
        providerId: providerMap['mts'],
        speed: 200,
        price: 890,
        connectionPrice: 0,
        technology: 'fiber',
        hasTV: true,
        tvChannels: 180,
        hasMobile: true,
        mobileMinutes: 800,
        mobileGB: 30,
        mobileSMS: 100,
        promoPrice: 1,
        promoMonths: 1,
        promoText: '30 дней за 1 р.',
        favoriteLabel: 'KION',
        favoriteDesc: 'Дополнительное приложение',
        popularity: 90,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Билайн - Всё в одном
      {
        name: 'Всё в одном',
        description: 'Интернет 300 Мбит/с + ТВ 200 каналов + мобильная связь',
        providerId: providerMap['beeline'],
        speed: 300,
        price: 1100,
        connectionPrice: 300,
        technology: 'fiber',
        hasTV: true,
        tvChannels: 200,
        hasMobile: true,
        mobileMinutes: 1500,
        mobileGB: 50,
        mobileSMS: 200,
        promoPrice: 0,
        promoMonths: 2,
        promoText: '60 дней за 0 р.',
        favoriteLabel: 'Wink',
        favoriteDesc: 'Дополнительное приложение',
        popularity: 85,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ДОМ.RU - Интернет + ТВ Стартовый
      {
        name: 'Интернет + ТВ Стартовый',
        description: 'Интернет 150 Мбит/с + ТВ 100 каналов',
        providerId: providerMap['domru'],
        speed: 150,
        price: 650,
        connectionPrice: 0,
        technology: 'fiber',
        hasTV: true,
        tvChannels: 100,
        hasMobile: false,
        mobileMinutes: null,
        mobileGB: null,
        mobileSMS: null,
        promoPrice: 0,
        promoMonths: 0, // 0.5 месяца = 14 дней, но поле INTEGER, используем 0 и указываем в promoText
        promoText: '14 дней за 0 р.',
        favoriteLabel: null,
        favoriteDesc: null,
        popularity: 80,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Мегафон - Объединяй! Максимум
      {
        name: 'Объединяй! Максимум',
        description: 'Интернет 500 Мбит/с + ТВ 250 каналов + мобильная связь безлимит',
        providerId: providerMap['megafon'],
        speed: 500,
        price: 1500,
        connectionPrice: 0,
        technology: 'fiber',
        hasTV: true,
        tvChannels: 250,
        hasMobile: true,
        mobileMinutes: 2000,
        mobileGB: 999, // Безлимит (большое число для обозначения)
        mobileSMS: 500,
        promoPrice: 0,
        promoMonths: 1,
        promoText: '30 дней за 0 р.',
        favoriteLabel: null,
        favoriteDesc: null,
        popularity: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tariffs', {}, {});
  },
};


