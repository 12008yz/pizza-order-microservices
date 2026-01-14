import { EquipmentService } from '../../services/equipment.service';
import { Equipment, EquipmentType } from '../../models';
import axios from 'axios';

jest.mock('../../models');
jest.mock('axios');

describe('EquipmentService', () => {
  let equipmentService: EquipmentService;

  beforeEach(() => {
    equipmentService = new EquipmentService();
    jest.clearAllMocks();
  });

  describe('getAllEquipmentTypes', () => {
    it('should return all equipment types', async () => {
      const mockTypes = [
        { id: 1, name: 'Роутер', slug: 'router' },
        { id: 2, name: 'ТВ-приставка', slug: 'tv-set-top' },
      ];

      (EquipmentType.findAll as jest.Mock).mockResolvedValue(mockTypes);

      const result = await equipmentService.getAllEquipmentTypes();

      expect(result).toEqual(mockTypes);
      expect(EquipmentType.findAll).toHaveBeenCalledWith({
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

      (Equipment.findAll as jest.Mock).mockResolvedValue(mockEquipment);

      const result = await equipmentService.getEquipmentByProvider(1);

      expect(result).toEqual(mockEquipment);
      expect(Equipment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            providerId: 1,
            isActive: true,
          }),
        })
      );
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

      (EquipmentType.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Роутер' });
      (axios.get as jest.Mock).mockResolvedValue({ data: { success: true } });
      (Equipment.create as jest.Mock).mockResolvedValue(mockEquipment);

      const result = await equipmentService.createEquipment({
        name: 'Роутер Wi-Fi 6',
        description: 'Описание',
        providerId: 1,
        equipmentTypeId: 1,
      });

      expect(result).toEqual(mockEquipment);
      expect(EquipmentType.findByPk).toHaveBeenCalledWith(1);
      expect(axios.get).toHaveBeenCalled();
      expect(Equipment.create).toHaveBeenCalled();
    });

    it('should throw error if provider not found', async () => {
      (EquipmentType.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Роутер' });
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 404 } });

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
