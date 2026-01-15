import { Request, Response, NextFunction } from 'express';
import { TariffService } from '../../services/tariff.service';

// Мокируем TariffService перед импортом контроллера
const mockGetAllTariffs = jest.fn();
const mockGetTariffById = jest.fn();
const mockGetTariffsByAddress = jest.fn();
const mockCreateTariff = jest.fn();
const mockUpdateTariff = jest.fn();
const mockDeleteTariff = jest.fn();

jest.mock('../../services/tariff.service', () => {
  return {
    TariffService: jest.fn().mockImplementation(() => ({
      getAllTariffs: mockGetAllTariffs,
      getTariffById: mockGetTariffById,
      getTariffsByAddress: mockGetTariffsByAddress,
      createTariff: mockCreateTariff,
      updateTariff: mockUpdateTariff,
      deleteTariff: mockDeleteTariff,
    })),
  };
});

// Импортируем контроллеры после мокирования
import {
  getAllTariffs,
  getTariffById,
  getTariffsByAddress,
  createTariff,
  updateTariff,
  deleteTariff,
} from '../../controllers/tariff.controller';

describe('TariffController', () => {
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

  describe('getAllTariffs', () => {
    it('should return all tariffs without filters', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', price: 500 },
        { id: 2, name: 'Tariff 2', price: 700 },
      ];

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      await getAllTariffs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllTariffs).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTariffs,
      });
    });

    it('should apply filters from query parameters', async () => {
      const mockTariffs = [{ id: 1, name: 'Tariff 1', providerId: 1 }];

      mockRequest.query = {
        providerId: '1',
        serviceType: 'internet',
        minPrice: '500',
        maxPrice: '1000',
        sortBy: 'price',
        sortOrder: 'asc',
      };

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      await getAllTariffs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllTariffs).toHaveBeenCalledWith({
        providerId: 1,
        serviceType: 'internet',
        minPrice: 500,
        maxPrice: 1000,
        sortBy: 'price',
        sortOrder: 'asc',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockGetAllTariffs.mockRejectedValue(error);

      await getAllTariffs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTariffById', () => {
    it('should return tariff by id', async () => {
      const mockTariff = {
        id: 1,
        name: 'Tariff 1',
        price: 500,
        providerId: 1,
      };

      mockRequest.params = { id: '1' };
      mockGetTariffById.mockResolvedValue(mockTariff);

      await getTariffById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetTariffById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle tariff not found', async () => {
      const error = new Error('Tariff not found') as any;
      error.statusCode = 404;

      mockRequest.params = { id: '999' };
      mockGetTariffById.mockRejectedValue(error);

      await getTariffById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTariffsByAddress', () => {
    it('should return tariffs by address', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', city: 'Москва' },
      ];

      mockRequest.query = {
        city: 'Москва',
        street: 'Тверская',
        house: '1',
      };

      mockGetTariffsByAddress.mockResolvedValue(mockTariffs);

      await getTariffsByAddress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetTariffsByAddress).toHaveBeenCalledWith(
        'Москва',
        'Тверская',
        1
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createTariff', () => {
    it('should create new tariff', async () => {
      const tariffData = {
        name: 'New Tariff',
        providerId: 1,
        price: 500,
        speed: 100,
      };

      const createdTariff = {
        id: 3,
        ...tariffData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = tariffData;
      mockCreateTariff.mockResolvedValue(createdTariff);

      await createTariff(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreateTariff).toHaveBeenCalledWith(tariffData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateTariff', () => {
    it('should update existing tariff', async () => {
      const updateData = {
        name: 'Updated Tariff',
        price: 600,
      };

      const updatedTariff = {
        id: 1,
        ...updateData,
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUpdateTariff.mockResolvedValue(updatedTariff);

      await updateTariff(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUpdateTariff).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteTariff', () => {
    it('should delete tariff', async () => {
      mockRequest.params = { id: '1' };
      mockDeleteTariff.mockResolvedValue({ success: true });

      await deleteTariff(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDeleteTariff).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
