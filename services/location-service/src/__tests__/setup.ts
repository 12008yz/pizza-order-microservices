import { sequelize } from '../config/database';

// Настройка тестовой среды
beforeAll(async () => {
  // Подключаемся к тестовой БД
  // В тестах можно использовать in-memory БД или отдельную тестовую БД
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
});

afterAll(async () => {
  // Закрываем соединение с БД после всех тестов
  await sequelize.close();
});

// Очистка БД перед каждым тестом (опционально)
beforeEach(async () => {
  // Можно добавить очистку таблиц, если нужно
});
