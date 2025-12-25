import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('products', [
      {
        name: 'Маргарита',
        description: 'Классическая пицца с томатами, моцареллой и базиликом',
        price: 450,
        category: 'pizza',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Пепперони',
        description: 'Острая пицца с колбасой пепперони и сыром',
        price: 550,
        category: 'pizza',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Четыре сыра',
        description: 'Пицца с моцареллой, горгонзолой, пармезаном и чеддером',
        price: 600,
        category: 'pizza',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Гавайская',
        description: 'Пицца с ветчиной, ананасами и сыром',
        price: 580,
        category: 'pizza',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Кола',
        description: 'Газированный напиток 0.5л',
        price: 120,
        category: 'drink',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Сок апельсиновый',
        description: 'Свежевыжатый апельсиновый сок 0.3л',
        price: 150,
        category: 'drink',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Чесночные гренки',
        description: 'Хрустящие гренки с чесноком и зеленью',
        price: 180,
        category: 'side',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('products', {}, {});
  },
};

