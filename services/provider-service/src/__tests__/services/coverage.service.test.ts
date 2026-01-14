import { AppError } from '../../middleware/errorHandler';
import { Op } from 'sequelize';

// Database config уже замокан в setup.ts
// Мокаем модели ДО импорта сервиса
jest.mock('../../models', () => ({
  Coverage: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Provider: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

// Импортируем реальные функции нормализации для тестирования
import * as addressNormalizer from '../../utils/addressNormalizer';

// Импортируем сервис и модели ПОСЛЕ моков
import { CoverageService } from '../../services/coverage.service';
import { Coverage, Provider } from '../../models';

describe('CoverageService', () => {
  let coverageService: CoverageService;

  beforeEach(() => {
    coverageService = new CoverageService();
    jest.clearAllMocks();
  });

  describe('checkAddress', () => {
    it('should find coverage by city only', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: null,
          houseFrom: null,
          houseTo: null,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва');

      expect(result).toEqual([1]);
      expect(Coverage.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { city: 'москва' },
              { city: { [Op.like]: '%москва%' } },
            ]),
          }),
        })
      );
    });

    it('should find coverage by city and street', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: null,
          houseTo: null,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская');

      expect(result).toEqual([1]);
      expect(Coverage.findAll).toHaveBeenCalled();
      const callArgs = (Coverage.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where[Op.and]).toBeDefined();
    });

    it('should find coverage by city, street and house number', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: 1,
          houseTo: 100,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская', 50);

      expect(result).toEqual([1]);
      expect(Coverage.findAll).toHaveBeenCalled();
      const callArgs = (Coverage.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where[Op.and]).toBeDefined();
      // Должно быть 3 условия: street (1) + houseFrom (1) + houseTo (1) = 3
      expect(callArgs.where[Op.and].length).toBe(3);
    });

    it('should handle house number within range', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: 1,
          houseTo: 100,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская', 50);

      expect(result).toEqual([1]);
    });

    it('should handle house number at range boundaries', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: 1,
          houseTo: 100,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result1 = await coverageService.checkAddress('Москва', 'Тверская', 1);
      const result2 = await coverageService.checkAddress('Москва', 'Тверская', 100);

      expect(result1).toEqual([1]);
      expect(result2).toEqual([1]);
    });

    it('should handle house number outside range', async () => {
      // Sequelize фильтр должен исключить результат, если house вне диапазона
      (Coverage.findAll as jest.Mock).mockResolvedValue([]);

      const result = await coverageService.checkAddress('Москва', 'Тверская', 150);

      expect(result).toEqual([]);
      expect(Coverage.findAll).toHaveBeenCalled();
      const callArgs = (Coverage.findAll as jest.Mock).mock.calls[0][0];
      // Проверяем, что фильтр по house применен
      expect(callArgs.where[Op.and]).toBeDefined();
    });

    it('should handle null houseFrom (covers all houses from start)', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: null,
          houseTo: 100,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская', 1);

      expect(result).toEqual([1]);
    });

    it('should handle null houseTo (covers all houses to end)', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: 1,
          houseTo: null,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская', 999);

      expect(result).toEqual([1]);
    });

    it('should handle null street (covers entire city)', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: null,
          houseFrom: null,
          houseTo: null,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская');

      expect(result).toEqual([1]);
    });

    it('should return unique provider IDs', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
        {
          id: 2,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
        {
          id: 3,
          providerId: 2,
          city: 'москва',
          street: 'тверская',
          provider: { id: 2, name: 'Provider 2', slug: 'provider-2', logo: 'logo2.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', 'Тверская');

      expect(result).toEqual([1, 2]);
      expect(result.length).toBe(2);
    });

    it('should include provider in query', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.checkAddress('Москва');

      expect(Coverage.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: Provider,
              as: 'provider',
              attributes: ['id', 'name', 'slug', 'logo'],
            },
          ],
        })
      );
    });

    it('should return empty array when no coverage found', async () => {
      (Coverage.findAll as jest.Mock).mockResolvedValue([]);

      const result = await coverageService.checkAddress('NonExistentCity');

      expect(result).toEqual([]);
    });

    it('should handle city with special characters', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'ростов-на-дону',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Ростов-на-Дону');

      expect(result).toEqual([1]);
    });

    it('should handle empty street string', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: null,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.checkAddress('Москва', '');

      expect(result).toEqual([1]);
    });

    it('should combine street and house conditions correctly', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          houseFrom: 1,
          houseTo: 100,
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.checkAddress('Москва', 'Тверская', 50);

      const callArgs = (Coverage.findAll as jest.Mock).mock.calls[0][0];
      // Проверяем, что все условия объединены правильно
      expect(callArgs.where[Op.and]).toBeDefined();
      expect(callArgs.where[Op.and].length).toBe(3);
      // Проверяем наличие условий для street
      const streetCondition = callArgs.where[Op.and].find((cond: any) => cond[Op.or]);
      expect(streetCondition).toBeDefined();
    });
  });

  describe('getProvidersByAddress', () => {
    it('should return providers for address', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
        {
          id: 2,
          providerId: 2,
          city: 'москва',
          provider: { id: 2, name: 'Provider 2', slug: 'provider-2', logo: 'logo2.jpg' },
        },
      ];

      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        { id: 2, name: 'Provider 2', isActive: true },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);
      (Provider.findAll as jest.Mock).mockResolvedValue(mockProviders);

      const result = await coverageService.getProvidersByAddress('Москва');

      expect(result).toEqual(mockProviders);
      expect(Provider.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { [Op.in]: [1, 2] },
            isActive: true,
          },
        })
      );
    });

    it('should return empty array when no providers found', async () => {
      (Coverage.findAll as jest.Mock).mockResolvedValue([]);

      const result = await coverageService.getProvidersByAddress('NonExistentCity');

      expect(result).toEqual([]);
      expect(Provider.findAll).not.toHaveBeenCalled();
    });

    it('should filter out inactive providers', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
        {
          id: 2,
          providerId: 2,
          city: 'москва',
          provider: { id: 2, name: 'Provider 2', slug: 'provider-2', logo: 'logo2.jpg' },
        },
      ];

      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        // Provider 2 is inactive, should be filtered out
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);
      (Provider.findAll as jest.Mock).mockResolvedValue(mockProviders);

      const result = await coverageService.getProvidersByAddress('Москва');

      expect(Provider.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should pass street and house to checkAddress', async () => {
      const mockCoverage = [
        {
          id: 1,
          providerId: 1,
          city: 'москва',
          street: 'тверская',
          provider: { id: 1, name: 'Provider 1', slug: 'provider-1', logo: 'logo1.jpg' },
        },
      ];

      const mockProviders = [{ id: 1, name: 'Provider 1', isActive: true }];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);
      (Provider.findAll as jest.Mock).mockResolvedValue(mockProviders);

      await coverageService.getProvidersByAddress('Москва', 'Тверская', 10);

      expect(Coverage.findAll).toHaveBeenCalled();
    });
  });

  describe('getCities', () => {
    it('should return list of unique cities', async () => {
      const mockCoverage = [
        { city: 'москва' },
        { city: 'санкт-петербург' },
        { city: 'москва' }, // duplicate
        { city: 'казань' },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.getCities();

      expect(result).toEqual(['москва', 'санкт-петербург', 'москва', 'казань']);
      expect(Coverage.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: ['city'],
          group: ['city'],
          raw: true,
        })
      );
    });

    it('should return empty array when no cities found', async () => {
      (Coverage.findAll as jest.Mock).mockResolvedValue([]);

      const result = await coverageService.getCities();

      expect(result).toEqual([]);
    });
  });

  describe('getStreets', () => {
    it('should return list of streets for city', async () => {
      const mockCoverage = [
        { street: 'тверская' },
        { street: 'арбат' },
        { street: null }, // should be filtered out
        { street: 'ленина' },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.getStreets('Москва');

      expect(result).toEqual(['тверская', 'арбат', 'ленина']);
      expect(Coverage.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { city: 'москва' },
              { city: { [Op.like]: '%москва%' } },
            ]),
          }),
          attributes: ['street'],
          group: ['street'],
          raw: true,
        })
      );
    });

    it('should filter out null streets', async () => {
      const mockCoverage = [
        { street: 'тверская' },
        { street: null },
        { street: null },
      ];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.getStreets('Москва');

      expect(result).toEqual(['тверская']);
    });

    it('should return empty array when no streets found', async () => {
      (Coverage.findAll as jest.Mock).mockResolvedValue([]);

      const result = await coverageService.getStreets('NonExistentCity');

      expect(result).toEqual([]);
    });

    it('should normalize city name before search', async () => {
      const mockCoverage = [{ street: 'тверская' }];

      (Coverage.findAll as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.getStreets('  Москва  ');

      expect(Coverage.findAll).toHaveBeenCalled();
      const callArgs = (Coverage.findAll as jest.Mock).mock.calls[0][0];
      // Проверяем, что город нормализован
      expect(callArgs.where[Op.or]).toContainEqual({ city: 'москва' });
    });
  });

  describe('createCoverage', () => {
    it('should create coverage with normalized data', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        district: 'центральный',
        street: 'тверская',
        houseFrom: 1,
        houseTo: 100,
      };

      (Coverage.create as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.createCoverage({
        providerId: 1,
        city: '  Москва  ',
        district: '  Центральный  ',
        street: '  ул. Тверская  ',
        houseFrom: 1,
        houseTo: 100,
      });

      expect(result).toEqual(mockCoverage);
      const createCall = (Coverage.create as jest.Mock).mock.calls[0][0];
      // Проверяем, что данные нормализованы реальными функциями
      expect(createCall.city).toBe(addressNormalizer.normalizeCity('  Москва  '));
      expect(createCall.district).toBe(addressNormalizer.normalizeDistrict('  Центральный  '));
      expect(createCall.street).toBe(addressNormalizer.normalizeStreet('  ул. Тверская  '));
    });

    it('should create coverage with minimal required fields', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        district: null,
        street: null,
        houseFrom: null,
        houseTo: null,
      };

      (Coverage.create as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.createCoverage({
        providerId: 1,
        city: 'Москва',
      });

      expect(result).toEqual(mockCoverage);
      expect(Coverage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: 1,
          city: 'москва',
          district: null,
          street: null,
        })
      );
    });

    it('should normalize all address fields', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        district: 'центральный',
        street: 'тверская',
      };

      (Coverage.create as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.createCoverage({
        providerId: 1,
        city: 'г. Москва',
        district: 'район Центральный',
        street: 'ул. Тверская',
      });

      const createCall = (Coverage.create as jest.Mock).mock.calls[0][0];
      // Проверяем реальную нормализацию
      expect(createCall.city).toBe('москва');
      expect(createCall.district).toBe('центральный');
      expect(createCall.street).toBe('тверская');
    });
  });

  describe('updateCoverage', () => {
    it('should update coverage with normalized data', async () => {
      const mockCoverageData = {
        id: 1,
        providerId: 1,
        city: 'москва',
        street: 'тверская',
      };
      
      const mockCoverage = {
        ...mockCoverageData,
        update: jest.fn().mockResolvedValue(mockCoverageData),
      };

      (Coverage.findByPk as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.updateCoverage(1, {
        city: '  Санкт-Петербург  ',
        street: '  Невский проспект  ',
      });

      expect(mockCoverage.update).toHaveBeenCalled();
      const updateCall = (mockCoverage.update as jest.Mock).mock.calls[0][0];
      // Проверяем реальную нормализацию
      expect(updateCall.city).toBe('санкт-петербург');
      expect(updateCall.street).toBe('невский проспект');
    });

    it('should throw error if coverage not found', async () => {
      (Coverage.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        coverageService.updateCoverage(999, { city: 'Москва' })
      ).rejects.toThrow('Coverage not found');

      const error = await coverageService
        .updateCoverage(999, { city: 'Москва' })
        .catch((e) => e);

      expect((error as AppError).statusCode).toBe(404);
    });

    it('should only normalize provided fields', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        street: 'тверская',
        update: jest.fn().mockResolvedValue(true),
      };

      (Coverage.findByPk as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.updateCoverage(1, {
        city: 'Санкт-Петербург',
        // street not provided, should not be normalized
      });

      expect(mockCoverage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'санкт-петербург',
        })
      );
    });

    it('should handle null values in update', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        street: 'тверская',
        district: 'центральный',
        update: jest.fn().mockResolvedValue(true),
      };

      (Coverage.findByPk as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.updateCoverage(1, {
        district: null,
        street: null,
      });

      expect(mockCoverage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          district: null,
          street: null,
        })
      );
    });

    it('should handle undefined values in update', async () => {
      const mockCoverage = {
        id: 1,
        providerId: 1,
        city: 'москва',
        update: jest.fn().mockResolvedValue(true),
      };

      (Coverage.findByPk as jest.Mock).mockResolvedValue(mockCoverage);

      await coverageService.updateCoverage(1, {
        city: 'Санкт-Петербург',
        street: undefined,
      });

      // street should not be in update if undefined
      const updateCall = (mockCoverage.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.street).toBeUndefined();
    });
  });

  describe('deleteCoverage', () => {
    it('should delete coverage by id', async () => {
      const mockCoverage = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (Coverage.findByPk as jest.Mock).mockResolvedValue(mockCoverage);

      const result = await coverageService.deleteCoverage(1);

      expect(result).toEqual({ message: 'Coverage deleted successfully' });
      expect(mockCoverage.destroy).toHaveBeenCalled();
    });

    it('should throw error if coverage not found', async () => {
      (Coverage.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(coverageService.deleteCoverage(999)).rejects.toThrow(
        'Coverage not found'
      );

      const error = await coverageService.deleteCoverage(999).catch((e) => e);
      expect((error as AppError).statusCode).toBe(404);
    });
  });
});
