// Мокируем sequelize ПЕРЕД импортом
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
};

jest.mock('../../config/database', () => ({
  sequelize: mockSequelize,
}));

// Создаем моки моделей с init
const createMockModel = (defaultData: any = []) => ({
  init: jest.fn(),
  findAll: jest.fn().mockResolvedValue(defaultData),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  hasOne: jest.fn(),
});

const mockRegion = createMockModel([
  { id: 1, name: 'Московская область' },
  { id: 2, name: 'Ленинградская область' },
]);
const mockCity = createMockModel([
  { id: 1, name: 'Москва', regionId: 1 },
]);
const mockStreetType = createMockModel([
  { id: 1, name: 'улица', shortName: 'ул.' },
]);
const mockStreet = createMockModel([]);
const mockBuilding = createMockModel([]);
const mockApartment = createMockModel([]);

// Мокируем каждый файл модели отдельно
jest.mock('../../models/Region', () => ({
  Region: mockRegion,
}));

jest.mock('../../models/City', () => ({
  City: mockCity,
}));

jest.mock('../../models/StreetType', () => ({
  StreetType: mockStreetType,
}));

jest.mock('../../models/Street', () => ({
  Street: mockStreet,
}));

jest.mock('../../models/Building', () => ({
  Building: mockBuilding,
}));

jest.mock('../../models/Apartment', () => ({
  Apartment: mockApartment,
}));

// Мокируем models/index.ts чтобы избежать вызова belongsTo
jest.mock('../../models/index', () => ({
  Region: mockRegion,
  City: mockCity,
  StreetType: mockStreetType,
  Street: mockStreet,
  Building: mockBuilding,
  Apartment: mockApartment,
}));

// Мокируем модели перед импортом routes
jest.mock('../../models', () => ({
  Region: mockRegion,
  City: mockCity,
  StreetType: mockStreetType,
  Street: mockStreet,
  Building: mockBuilding,
  Apartment: mockApartment,
}));

// Мокируем GeocoderService
jest.mock('../../services/geocoder.service', () => ({
  GeocoderService: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue([]),
    autocomplete: jest.fn().mockResolvedValue([]),
  })),
}));

// Мокируем LocationService
const mockLocationServiceInstance = {
  getRegions: jest.fn().mockResolvedValue([
    { id: 1, name: 'Московская область' },
    { id: 2, name: 'Ленинградская область' },
  ]),
  getCitiesByRegion: jest.fn().mockResolvedValue([
    { id: 1, name: 'Москва', regionId: 1 },
  ]),
  getStreetTypes: jest.fn().mockResolvedValue([
    { id: 1, name: 'улица', shortName: 'ул.' },
  ]),
  getStreetsByCity: jest.fn().mockResolvedValue([]),
  getBuildingsByStreet: jest.fn().mockResolvedValue([]),
  getApartmentsByBuilding: jest.fn().mockResolvedValue([]),
  searchAddress: jest.fn().mockResolvedValue([]),
  autocompleteAddress: jest.fn().mockResolvedValue([]),
  searchLocal: jest.fn().mockResolvedValue([]),
};

jest.mock('../../services/location.service', () => ({
  LocationService: jest.fn().mockImplementation(() => mockLocationServiceInstance),
}));

import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';
import locationRoutes from '../../routes/location.routes';

// Создаем тестовое приложение
const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);
app.use(errorHandler);

describe('Location API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/locations/regions', () => {
    it('should return list of regions', async () => {
      const response = await request(app)
        .get('/api/locations/regions')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/locations/cities', () => {
    it('should return 400 if region_id is missing', async () => {
      const response = await request(app)
        .get('/api/locations/cities')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return cities for a region', async () => {
      const response = await request(app)
        .get('/api/locations/cities?region_id=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/locations/street-types', () => {
    it('should return list of street types', async () => {
      const response = await request(app)
        .get('/api/locations/street-types')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/locations/search', () => {
    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should search addresses', async () => {
      const query = encodeURIComponent('Москва');
      const response = await request(app)
        .get(`/api/locations/search?q=${query}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});
