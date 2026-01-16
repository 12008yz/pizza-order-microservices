// Мокируем модели ДО импорта сервиса (сервис импортирует напрямую из файлов)
const mockEquipmentFindAll = jest.fn();
const mockEquipmentFindByPk = jest.fn();
const mockEquipmentCreate = jest.fn();
const mockEquipmentTypeFindAll = jest.fn();
const mockEquipmentTypeFindByPk = jest.fn();
const mockEquipmentTypeCreate = jest.fn();

jest.mock('../../models/Equipment', () => ({
  Equipment: {
    findAll: mockEquipmentFindAll,
    findByPk: mockEquipmentFindByPk,
    create: mockEquipmentCreate,
  },
}));

jest.mock('../../models/EquipmentType', () => ({
  EquipmentType: {
    findAll: mockEquipmentTypeFindAll,
    findByPk: mockEquipmentTypeFindByPk,
    create: mockEquipmentTypeCreate,
  },
}));

// axios уже замокан в setup.ts, но нужно правильно его использовать
const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
const mockAxiosPut = jest.fn();
const mockAxiosDelete = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
  },
}));

import { EquipmentService } from '../../services/equipment.service';
import { Equipment } from '../../models/Equipment';
import { EquipmentType } from '../../models/EquipmentType';
import axios from 'axios';

describe('EquipmentService', () => {
  let equipmentService: EquipmentService;

  beforeEach(() => {
    equipmentService = new EquipmentService();
    jest.clearAllMocks();
    // Сбрасываем моки
    mockEquipmentFindAll.mockClear();
    mockEquipmentFindByPk.mockClear();
    mockEquipmentCreate.mockClear();
    mockEquipmentTypeFindAll.mockClear();
    mockEquipmentTypeFindByPk.mockClear();
    mockEquipmentTypeCreate.mockClear();
    mockAxiosGet.mockClear();
    mockAxiosPost.mockClear();
    mockAxiosPut.mockClear();
    mockAxiosDelete.mockClear();
  });

  describe('getAllEquipmentTypes', () => {
    it('should return all equipment types', async () => {
      const mockTypes = [
        { id: 1, name: 'Роутер', slug: 'router' },
        { id: 2, name: 'ТВ-приставка', slug: 'tv-set-top' },
      ];

      mockEquipmentTypeFindAll.mockResolvedValue(mockTypes);

      const result = await equipmentService.getAllEquipmentTypes();

      expect(result).toEqual(mockTypes);
      expect(mockEquipmentTypeFindAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
    });
  });

  describe('getEquipmentByProvider', () => {
    it('should return equipment for a provider', async () => {
      const mockEquipment = [
        {
          id: 1,
          name: 'Роутер Wi-Fi 6',
          providerId: 1,
          equipmentType: { id: 1, name: 'Роутер' },
        },
      ];

      // getEquipmentByProvider использует getAllEquipment с фильтром providerId
      mockEquipmentFindAll.mockResolvedValue(mockEquipment);

      const result = await equipmentService.getEquipmentByProvider(1);

      expect(result).toEqual(mockEquipment);
      // Проверяем, что был вызван findAll с правильными параметрами
      expect(mockEquipmentFindAll).toHaveBeenCalled();
      const callArgs = mockEquipmentFindAll.mock.calls[0][0];
      expect(callArgs.where.providerId).toBe(1);
      expect(callArgs.where.isActive).toBe(true);
    });
  });

  describe('createEquipment', () => {
    it('should create equipment and verify provider exists', async () => {
      const mockEquipment = {
        id: 1,
        name: 'Роутер Wi-Fi 6',
        providerId: 1,
        equipmentTypeId: 1,
      };

      mockEquipmentTypeFindByPk.mockResolvedValue({ id: 1, name: 'Роутер' });
      mockAxiosGet.mockResolvedValue({ data: { success: true } });
      mockEquipmentCreate.mockResolvedValue(mockEquipment);

      const result = await equipmentService.createEquipment({
        name: 'Роутер Wi-Fi 6',
        description: 'Описание',
        providerId: 1,
        equipmentTypeId: 1,
      });

      expect(result).toEqual(mockEquipment);
      expect(mockEquipmentTypeFindByPk).toHaveBeenCalledWith(1);
      expect(mockAxiosGet).toHaveBeenCalled();
      expect(mockEquipmentCreate).toHaveBeenCalled();
    });

    it('should throw error if provider not found', async () => {
      mockEquipmentTypeFindByPk.mockResolvedValue({ id: 1, name: 'Роутер' });
      mockAxiosGet.mockRejectedValue({ response: { status: 404 } });

      await expect(
        equipmentService.createEquipment({
          name: 'Роутер',
          description: 'Описание',
          providerId: 999,
          equipmentTypeId: 1,
        })
      ).rejects.toThrow('Provider not found');
    });
  });
});
