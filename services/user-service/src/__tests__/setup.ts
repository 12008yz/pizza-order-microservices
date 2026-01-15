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
jest.mock('../models/UserProfile', () => ({
  UserProfile: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
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

// Мокируем axios для Auth Service
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Настройка тестовой среды
beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }

  // Устанавливаем тестовые переменные окружения
  process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
});

afterAll(async () => {
  // Очистка после всех тестов
  jest.clearAllMocks();
});

beforeEach(() => {
  // Очистка моков перед каждым тестом
  jest.clearAllMocks();
});
