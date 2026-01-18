// Мокируем sequelize перед импортом моделей
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  transaction: jest.fn(),
  query: jest.fn(),
};

jest.mock('../config/database', () => ({
  sequelize: mockSequelize,
}));

// Мокируем модели перед их использованием
const createMockModel = () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn(),
  count: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  hasOne: jest.fn(),
});

jest.mock('../models', () => ({
  Region: createMockModel(),
  City: createMockModel(),
  StreetType: createMockModel(),
  Street: createMockModel(),
  Building: createMockModel(),
  Apartment: createMockModel(),
}));

// Мокируем CoverageAutocompleteService
jest.mock('../services/coverage-autocomplete.service', () => ({
  CoverageAutocompleteService: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue([]),
    autocomplete: jest.fn().mockResolvedValue([]),
  })),
}));

// Настройка тестовой среды
beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
});

afterAll(async () => {
  // Закрываем соединение с БД после всех тестов
  // await mockSequelize.close();
});

// Очистка БД перед каждым тестом (опционально)
beforeEach(async () => {
  jest.clearAllMocks();
});
