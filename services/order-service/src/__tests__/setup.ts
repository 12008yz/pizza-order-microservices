// Мокируем sequelize перед импортом моделей
const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  query: jest.fn(),
};

jest.mock('../config/database', () => ({
  sequelize: mockSequelize,
}));

// Мокируем axios для HTTP запросов
jest.mock('axios');

// Мокируем createHttpClient ДО импорта сервиса
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    response: {
      use: jest.fn(),
    },
    request: {
      use: jest.fn(),
    },
  },
};

jest.mock('../utils/httpClient', () => {
  return {
    createHttpClient: jest.fn(() => mockAxiosInstance),
    callService: jest.fn(async (serviceCall, fallback) => {
      try {
        return await serviceCall();
      } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
      }
    }),
  };
});

// Экспортируем мок для использования в тестах
export { mockAxiosInstance };

// Мокируем модели перед их использованием
const createMockModel = () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  upsert: jest.fn(),
  bulkCreate: jest.fn(),
  count: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  hasOne: jest.fn(),
});

jest.mock('../models', () => ({
  Order: createMockModel(),
  OrderItem: createMockModel(),
  OrderStatusHistory: createMockModel(),
}));

// Настройка тестовой среды
beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
});

afterAll(async () => {
  // Закрываем соединение с БД после всех тестов
});

// Очистка моков перед каждым тестом
beforeEach(async () => {
  jest.clearAllMocks();
});
