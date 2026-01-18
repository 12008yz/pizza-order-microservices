import { AvailabilityService } from '../../services/availability.service';
import axios from 'axios';

// Мокируем модели ПЕРЕД импортом
jest.mock('../../models', () => ({
  TechnicalAccess: {
    findAll: jest.fn(),
    upsert: jest.fn(),
  },
  AvailabilityCache: {
    findOne: jest.fn(),
    upsert: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Мокируем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Импортируем после моков
import { TechnicalAccess, AvailabilityCache } from '../../models';

describe('AvailabilityService', () => {
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    availabilityService = new AvailabilityService();
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should use fast path when buildingId is provided', async () => {
      (TechnicalAccess.findAll as jest.Mock).mockResolvedValue([
        { providerId: 1, isAvailable: true },
      ]);

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: [{ id: 1, name: 'Provider 1' }],
        },
      });

      const result = await availabilityService.checkAvailability({
        city: 'Москва',
        buildingId: 123,
      });

      expect(TechnicalAccess.findAll).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use cache when available', async () => {
      const mockCachedData = {
        addressHash: 'test-hash',
        availableProviders: JSON.stringify([1, 2]),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (AvailabilityCache.findOne as jest.Mock).mockResolvedValue(mockCachedData);
      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            { id: 1, name: 'Provider 1' },
            { id: 2, name: 'Provider 2' },
          ],
        },
      });

      const result = await availabilityService.checkAvailability({
        city: 'Москва',
        street: 'Тверская',
      });

      expect(AvailabilityCache.findOne).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });

    it('should query Provider Service when cache is empty', async () => {
      (AvailabilityCache.findOne as jest.Mock).mockResolvedValue(null);
      (AvailabilityCache.upsert as jest.Mock).mockResolvedValue({});

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: [{ id: 1, name: 'Provider 1' }],
        },
      });

      const result = await availabilityService.checkAvailability({
        city: 'Москва',
        street: 'Тверская',
        house: 10,
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/coverage/check'),
        expect.any(Object)
      );
      expect(AvailabilityCache.upsert).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle Provider Service errors gracefully', async () => {
      (AvailabilityCache.findOne as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('Service unavailable'));

      const result = await availabilityService.checkAvailability({
        city: 'Москва',
      });

      expect(result).toEqual([]);
    });
  });

  describe('getProvidersByAddressId', () => {
    it('should return providers by buildingId', async () => {
      (TechnicalAccess.findAll as jest.Mock).mockResolvedValue([
        { providerId: 1, isAvailable: true },
        { providerId: 2, isAvailable: true },
      ]);

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            { id: 1, name: 'Provider 1' },
            { id: 2, name: 'Provider 2' },
          ],
        },
      });

      const result = await availabilityService.getProvidersByAddressId(123);

      expect(TechnicalAccess.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });

    it('should return providers by apartmentId', async () => {
      (TechnicalAccess.findAll as jest.Mock).mockResolvedValue([
        { providerId: 1, isAvailable: true },
      ]);

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: [{ id: 1, name: 'Provider 1' }],
        },
      });

      const result = await availabilityService.getProvidersByAddressId(undefined, 456);

      expect(TechnicalAccess.findAll).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should return empty array when no providers found', async () => {
      (TechnicalAccess.findAll as jest.Mock).mockResolvedValue([]);

      const result = await availabilityService.getProvidersByAddressId(123);

      expect(result).toEqual([]);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should delete expired cache entries', async () => {
      // Мокируем destroy как статический метод модели
      const mockDestroy = jest.fn().mockResolvedValue(5);
      (AvailabilityCache as any).destroy = mockDestroy;

      const deleted = await availabilityService.cleanExpiredCache();

      expect(mockDestroy).toHaveBeenCalled();
      expect(deleted).toBe(5);
    });

    it('should handle errors gracefully', async () => {
      const mockDestroy = jest.fn().mockRejectedValue(new Error('DB error'));
      (AvailabilityCache as any).destroy = mockDestroy;

      const deleted = await availabilityService.cleanExpiredCache();

      expect(deleted).toBe(0);
    });
  });
});
