// Мокаем database config для ВСЕХ тестов ДО их запуска
// Это предотвращает попытки подключения к реальной БД
jest.mock('../config/database', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(),
    transaction: jest.fn(),
    query: jest.fn(),
    getQueryInterface: jest.fn(),
  };
  return {
    sequelize: mockSequelize,
  };
});

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
  // Устанавливаем переменные окружения для тестов
  process.env.DB_NAME = 'test_db';
  process.env.DB_USER = 'test_user';
  process.env.DB_PASSWORD = 'test_password';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
});

afterAll(async () => {
  // Ничего не делаем, так как sequelize замокан
});
