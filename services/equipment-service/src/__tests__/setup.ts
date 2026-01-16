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

// Мокируем models/index.ts чтобы избежать установки ассоциаций
jest.mock('../models', () => ({
  Equipment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    init: jest.fn(),
  },
  EquipmentType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    init: jest.fn(),
  },
}));

// Мокируем отдельные модели тоже (на случай прямого импорта)
jest.mock('../models/Equipment', () => ({
  Equipment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    init: jest.fn(),
  },
}));

jest.mock('../models/EquipmentType', () => ({
  EquipmentType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    init: jest.fn(),
  },
}));

// Мокируем axios для Provider Service
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

// Мокируем logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }

  // Устанавливаем тестовые переменные окружения
  process.env.PROVIDER_SERVICE_URL = 'http://localhost:3003';
});

afterAll(async () => {
  // Очистка после всех тестов
  jest.clearAllMocks();
});

beforeEach(() => {
  // Очистка моков перед каждым тестом
  jest.clearAllMocks();
});
