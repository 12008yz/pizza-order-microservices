// Мокируем sequelize ПЕРЕД импортом
const mockSequelize = {
  define: jest.fn(),
};

jest.mock('../../config/database', () => ({
  sequelize: mockSequelize,
}));

// Мокируем модели с init - создаем моки для каждого файла модели
const createMockModel = () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  hasOne: jest.fn(),
});

const mockRegion = createMockModel();
const mockCity = createMockModel();
const mockStreetType = createMockModel();
const mockStreet = createMockModel();
const mockBuilding = createMockModel();
const mockApartment = createMockModel();

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

// Мокируем LocationService - создаем мок с методами
const mockLocationServiceInstance = {
  getRegions: jest.fn(),
  getCitiesByRegion: jest.fn(),
  getStreetTypes: jest.fn(),
  getStreetsByCity: jest.fn(),
  getBuildingsByStreet: jest.fn(),
  getApartmentsByBuilding: jest.fn(),
  searchAddress: jest.fn(),
  autocompleteAddress: jest.fn(),
  searchLocal: jest.fn(),
};

// Мокируем LocationService так, чтобы при создании экземпляра возвращался наш мок
jest.mock('../../services/location.service', () => ({
  LocationService: jest.fn().mockImplementation(() => mockLocationServiceInstance),
}));

import { Request, Response, NextFunction } from 'express';
import * as locationController from '../../controllers/location.controller';

describe('LocationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getRegions', () => {
    it('should return all regions', async () => {
      const mockRegions = [
        { id: 1, name: 'Московская область' },
        { id: 2, name: 'Ленинградская область' },
      ];

      mockLocationServiceInstance.getRegions.mockResolvedValue(mockRegions);

      await locationController.getRegions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLocationServiceInstance.getRegions).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRegions,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockLocationServiceInstance.getRegions.mockRejectedValue(error);

      await locationController.getRegions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getCities', () => {
    it('should return cities for a region', async () => {
      mockRequest.query = { region_id: '1' };
      const mockCities = [
        { id: 1, name: 'Москва', regionId: 1 },
        { id: 2, name: 'Подольск', regionId: 1 },
      ];

      mockLocationServiceInstance.getCitiesByRegion.mockResolvedValue(mockCities);

      await locationController.getCities(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLocationServiceInstance.getCitiesByRegion).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCities,
      });
    });

    it('should return 400 if region_id is missing', async () => {
      mockRequest.query = {};

      await locationController.getCities(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockLocationServiceInstance.getCitiesByRegion).not.toHaveBeenCalled();
    });
  });
});
