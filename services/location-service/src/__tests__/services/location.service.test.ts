// Мокируем sequelize ПЕРЕД импортом
const mockSequelize = {
  define: jest.fn(),
};

jest.mock('../../config/database', () => ({
  sequelize: mockSequelize,
}));

// Мокируем модели с init
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

jest.mock('../../models', () => ({
  Region: mockRegion,
  City: mockCity,
  StreetType: mockStreetType,
  Street: mockStreet,
  Building: mockBuilding,
  Apartment: mockApartment,
}));

// Мокируем models/index.ts
jest.mock('../../models/index', () => ({
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

// Импортируем ПОСЛЕ моков
import { LocationService } from '../../services/location.service';
import { Region, City, Street, Building, Apartment } from '../../models';

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    locationService = new LocationService();
    jest.clearAllMocks();
  });

  describe('getRegions', () => {
    it('should return all regions', async () => {
      const mockRegions = [
        { id: 1, name: 'Московская область', code: 'MO' },
        { id: 2, name: 'Ленинградская область', code: 'LO' },
      ];

      (Region.findAll as jest.Mock).mockResolvedValue(mockRegions);

      const result = await locationService.getRegions();

      expect(result).toEqual(mockRegions);
      expect(Region.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
    });

    it('should handle errors', async () => {
      (Region.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(locationService.getRegions()).rejects.toThrow('Database error');
    });
  });

  describe('getCitiesByRegion', () => {
    it('should return cities for a region', async () => {
      const mockCities = [
        { id: 1, name: 'Москва', regionId: 1 },
        { id: 2, name: 'Подольск', regionId: 1 },
      ];

      (City.findAll as jest.Mock).mockResolvedValue(mockCities);

      const result = await locationService.getCitiesByRegion(1);

      expect(result).toEqual(mockCities);
      expect(City.findAll).toHaveBeenCalledWith({
        where: { regionId: 1 },
        include: expect.any(Array),
        order: [['name', 'ASC']],
      });
    });

    it('should return empty array if region not found', async () => {
      // Метод getCitiesByRegion не проверяет существование региона,
      // просто возвращает пустой массив, если города не найдены
      (City.findAll as jest.Mock).mockResolvedValue([]);

      const result = await locationService.getCitiesByRegion(999);

      expect(result).toEqual([]);
      expect(City.findAll).toHaveBeenCalledWith({
        where: { regionId: 999 },
        include: expect.any(Array),
        order: [['name', 'ASC']],
      });
    });
  });

  describe('getStreetsByCity', () => {
    it('should return streets for a city', async () => {
      const mockStreets = [
        { id: 1, name: 'Тверская', cityId: 1, streetTypeId: 1 },
        { id: 2, name: 'Арбат', cityId: 1, streetTypeId: 1 },
      ];

      (Street.findAll as jest.Mock).mockResolvedValue(mockStreets);
      (City.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Москва' });

      const result = await locationService.getStreetsByCity(1);

      expect(result).toEqual(mockStreets);
      expect(Street.findAll).toHaveBeenCalled();
    });
  });

  describe('getBuildingsByStreet', () => {
    it('should return buildings for a street', async () => {
      const mockBuildings = [
        { id: 1, number: '1', streetId: 1 },
        { id: 2, number: '2', streetId: 1 },
      ];

      (Building.findAll as jest.Mock).mockResolvedValue(mockBuildings);
      (Street.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Тверская' });

      const result = await locationService.getBuildingsByStreet(1);

      expect(result).toEqual(mockBuildings);
      expect(Building.findAll).toHaveBeenCalled();
    });
  });

  describe('getApartmentsByBuilding', () => {
    it('should return apartments for a building', async () => {
      const mockApartments = [
        { id: 1, number: '1', buildingId: 1 },
        { id: 2, number: '2', buildingId: 1 },
      ];

      (Apartment.findAll as jest.Mock).mockResolvedValue(mockApartments);
      (Building.findByPk as jest.Mock).mockResolvedValue({ id: 1, number: '1' });

      const result = await locationService.getApartmentsByBuilding(1);

      expect(result).toEqual(mockApartments);
      expect(Apartment.findAll).toHaveBeenCalled();
    });
  });
});
