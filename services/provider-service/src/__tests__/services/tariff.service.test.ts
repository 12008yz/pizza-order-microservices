import { Op } from 'sequelize';

// Мокаем модели ДО импорта сервиса (database уже замокан в setup.ts)
jest.mock('../../models', () => ({
  Tariff: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    init: jest.fn(),
  },
  Provider: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    init: jest.fn(),
  },
}));

import { TariffService } from '../../services/tariff.service';
import { Tariff, Provider } from '../../models';

describe('TariffService', () => {
  let tariffService: TariffService;

  beforeEach(() => {
    tariffService = new TariffService();
    jest.clearAllMocks();
  });

  describe('getAllTariffs', () => {
    it('should return all active tariffs', async () => {
      const mockTariffs = [
        {
          id: 1,
          name: 'Тариф 100',
          price: 500,
          speed: 100,
          provider: { id: 1, name: 'Провайдер 1' },
        },
      ];

      (Tariff.findAll as jest.Mock).mockResolvedValue(mockTariffs);

      const result = await tariffService.getAllTariffs();

      expect(result).toBeDefined();
      expect(result).toEqual(mockTariffs);
      expect(Tariff.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });

    it('should filter by providerId', async () => {
      const mockTariffs = [
        {
          id: 1,
          name: 'Тариф 100',
          providerId: 1,
        },
      ];

      (Tariff.findAll as jest.Mock).mockResolvedValue(mockTariffs);

      const result = await tariffService.getAllTariffs({ providerId: 1 });

      expect(result).toEqual(mockTariffs);
      expect(Tariff.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            providerId: 1,
          }),
        })
      );
    });

    it('should filter by serviceType (internet)', async () => {
      const mockTariffs = [
        {
          id: 1,
          name: 'Интернет 100',
          speed: 100,
        },
      ];

      (Tariff.findAll as jest.Mock).mockResolvedValue(mockTariffs);

      const result = await tariffService.getAllTariffs({ serviceType: 'internet' });

      expect(result).toEqual(mockTariffs);
      expect(Tariff.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            speed: { [Op.gt]: 0 },
          }),
        })
      );
    });

    it('should sort by price', async () => {
      const mockTariffs = [
        { id: 1, price: 300 },
        { id: 2, price: 500 },
      ];

      (Tariff.findAll as jest.Mock).mockResolvedValue(mockTariffs);

      const result = await tariffService.getAllTariffs({ sortBy: 'price', sortOrder: 'asc' });

      expect(result).toEqual(mockTariffs);
      expect(Tariff.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['price', 'ASC']],
        })
      );
    });

    it('should sort by speed', async () => {
      const mockTariffs = [
        { id: 1, speed: 50 },
        { id: 2, speed: 100 },
      ];

      (Tariff.findAll as jest.Mock).mockResolvedValue(mockTariffs);

      const result = await tariffService.getAllTariffs({ sortBy: 'speed', sortOrder: 'desc' });

      expect(result).toEqual(mockTariffs);
      expect(Tariff.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['speed', 'DESC']],
        })
      );
    });
  });

  describe('getTariffById', () => {
    it('should return tariff by id', async () => {
      const mockTariff = {
        id: 1,
        name: 'Тариф 100',
        price: 500,
      };

      (Tariff.findByPk as jest.Mock).mockResolvedValue(mockTariff);

      const result = await tariffService.getTariffById(1);

      expect(result).toEqual(mockTariff);
      expect(Tariff.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw error if tariff not found', async () => {
      (Tariff.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(tariffService.getTariffById(999)).rejects.toThrow('Tariff not found');
    });
  });
});
