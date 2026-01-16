// Мокируем базу данных ПЕРЕД импортом моделей
jest.mock('../config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(),
    transaction: jest.fn(),
    query: jest.fn(),
    getQueryInterface: jest.fn(),
  },
}));

// Мокируем модели Sequelize чтобы они не пытались инициализироваться
jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/AdminUser', () => ({
  AdminUser: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/RefreshToken', () => ({
  RefreshToken: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Мокируем logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Настройка тестовой среды
beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }

  // Устанавливаем тестовые секреты
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
});

afterAll(async () => {
  // Очистка после всех тестов
  jest.clearAllMocks();
});

beforeEach(() => {
  // Очистка моков перед каждым тестом
  jest.clearAllMocks();
});
