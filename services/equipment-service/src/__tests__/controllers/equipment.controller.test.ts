import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from '../../services/equipment.service';

// Мокируем EquipmentService перед импортом контроллера
const mockGetAllEquipmentTypes = jest.fn();
const mockGetEquipmentTypeById = jest.fn();
const mockGetAllEquipment = jest.fn();
const mockGetEquipmentById = jest.fn();
const mockGetEquipmentByProvider = jest.fn();
const mockCreateEquipment = jest.fn();
const mockUpdateEquipment = jest.fn();
const mockDeleteEquipment = jest.fn();

jest.mock('../../services/equipment.service', () => {
  return {
    EquipmentService: jest.fn().mockImplementation(() => ({
      getAllEquipmentTypes: mockGetAllEquipmentTypes,
      getEquipmentTypeById: mockGetEquipmentTypeById,
      getAllEquipment: mockGetAllEquipment,
      getEquipmentById: mockGetEquipmentById,
      getEquipmentByProvider: mockGetEquipmentByProvider,
      createEquipment: mockCreateEquipment,
      updateEquipment: mockUpdateEquipment,
      deleteEquipment: mockDeleteEquipment,
    })),
  };
});

// Импортируем контроллеры после мокирования
import {
  getAllEquipmentTypes,
  getEquipmentTypeById,
  getAllEquipment,
  getEquipmentById,
  getEquipmentByProvider,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../../controllers/equipment.controller';

describe('EquipmentController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAllEquipmentTypes', () => {
    it('should return all equipment types', async () => {
      const mockTypes = [
        { id: 1, name: 'Роутер', slug: 'router' },
        { id: 2, name: 'ТВ-приставка', slug: 'tv-set-top' },
      ];

      mockGetAllEquipmentTypes.mockResolvedValue(mockTypes);

      await getAllEquipmentTypes(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllEquipmentTypes).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTypes,
      });
    });
  });

  describe('getEquipmentTypeById', () => {
    it('should return equipment type by id', async () => {
      const mockType = {
        id: 1,
        name: 'Роутер',
        slug: 'router',
      };

      mockRequest.params = { id: '1' };
      mockGetEquipmentTypeById.mockResolvedValue(mockType);

      await getEquipmentTypeById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetEquipmentTypeById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllEquipment', () => {
    it('should return all equipment without filters', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', providerId: 1 },
        { id: 2, name: 'Router 2', providerId: 2 },
      ];

      mockGetAllEquipment.mockResolvedValue(mockEquipment);

      await getAllEquipment(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllEquipment).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should apply filters from query parameters', async () => {
      const mockEquipment = [{ id: 1, name: 'Router 1', providerId: 1 }];

      mockRequest.query = {
        providerId: '1',
        equipmentTypeId: '1',
        isActive: 'true',
      };

      mockGetAllEquipment.mockResolvedValue(mockEquipment);

      await getAllEquipment(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllEquipment).toHaveBeenCalledWith({
        providerId: 1,
        equipmentTypeId: 1,
        isActive: true,
      });
    });
  });

  describe('getEquipmentById', () => {
    it('should return equipment by id', async () => {
      const mockEquipment = {
        id: 1,
        name: 'Router 1',
        providerId: 1,
        purchasePrice: 5000,
      };

      mockRequest.params = { id: '1' };
      mockGetEquipmentById.mockResolvedValue(mockEquipment);

      await getEquipmentById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetEquipmentById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getEquipmentByProvider', () => {
    it('should return equipment by provider id', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', providerId: 1 },
        { id: 2, name: 'TV Set-top 1', providerId: 1 },
      ];

      mockRequest.params = { provider_id: '1' };
      mockGetEquipmentByProvider.mockResolvedValue(mockEquipment);

      await getEquipmentByProvider(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetEquipmentByProvider).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createEquipment', () => {
    it('should create new equipment', async () => {
      const equipmentData = {
        name: 'New Router',
        providerId: 1,
        equipmentTypeId: 1,
        purchasePrice: 5000,
        rentalMonthlyPrice: 500,
      };

      const createdEquipment = {
        id: 3,
        ...equipmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = equipmentData;
      mockCreateEquipment.mockResolvedValue(createdEquipment);

      await createEquipment(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreateEquipment).toHaveBeenCalledWith(equipmentData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateEquipment', () => {
    it('should update existing equipment', async () => {
      const updateData = {
        name: 'Updated Router',
        purchasePrice: 6000,
      };

      const updatedEquipment = {
        id: 1,
        ...updateData,
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUpdateEquipment.mockResolvedValue(updatedEquipment);

      await updateEquipment(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteEquipment', () => {
    it('should delete equipment', async () => {
      mockRequest.params = { id: '1' };
      mockDeleteEquipment.mockResolvedValue({ success: true });

      await deleteEquipment(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDeleteEquipment).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
