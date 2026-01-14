import { LocationService } from '../../services/location.service';
import { Region, City, Street, Building, Apartment } from '../../models';

// Мокируем модели
jest.mock('../../models', () => ({
  Region: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  City: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Street: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Building: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Apartment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    locationService = new LocationService();
    jest.clearAllMocks();
  });

  describe('getAllRegions', () => {
    it('should return all regions', async () => {
      const mockRegions = [
        { id: 1, name: 'Московская область', code: 'MO' },
        { id: 2, name: 'Ленинградская область', code: 'LO' },
      ];

      (Region.findAll as jest.Mock).mockResolvedValue(mockRegions);

      const result = await locationService.getAllRegions();

      expect(result).toEqual(mockRegions);
      expect(Region.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
    });

    it('should handle errors', async () => {
      (Region.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(locationService.getAllRegions()).rejects.toThrow('Database error');
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

    it('should throw error if region not found', async () => {
      (Region.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(locationService.getCitiesByRegion(999)).rejects.toThrow();
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
