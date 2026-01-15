import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../../services/provider.service';
import { TariffService } from '../../services/tariff.service';
import { CoverageService } from '../../services/coverage.service';

// Мокируем сервисы перед импортом контроллера
const mockGetAllProviders = jest.fn();
const mockGetProviderById = jest.fn();
const mockCreateProvider = jest.fn();
const mockUpdateProvider = jest.fn();
const mockGetAllTariffs = jest.fn();
const mockGetProvidersByAddress = jest.fn();

jest.mock('../../services/provider.service', () => {
  return {
    ProviderService: jest.fn().mockImplementation(() => ({
      getAllProviders: mockGetAllProviders,
      getProviderById: mockGetProviderById,
      createProvider: mockCreateProvider,
      updateProvider: mockUpdateProvider,
    })),
  };
});

jest.mock('../../services/tariff.service', () => {
  return {
    TariffService: jest.fn().mockImplementation(() => ({
      getAllTariffs: mockGetAllTariffs,
    })),
  };
});

jest.mock('../../services/coverage.service', () => {
  return {
    CoverageService: jest.fn().mockImplementation(() => ({
      getProvidersByAddress: mockGetProvidersByAddress,
    })),
  };
});

// Импортируем контроллеры после мокирования
import {
  getAllProviders,
  getProviderById,
  getProviderTariffs,
  getProviderCoverage,
  createProvider,
  updateProvider,
} from '../../controllers/provider.controller';

describe('ProviderController', () => {
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

  describe('getAllProviders', () => {
    it('should return all active providers by default', async () => {
      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        { id: 2, name: 'Provider 2', isActive: true },
      ];

      mockGetAllProviders.mockResolvedValue(mockProviders);

      await getAllProviders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllProviders).toHaveBeenCalledWith(true);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProviders,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return all providers including inactive when active=false', async () => {
      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        { id: 2, name: 'Provider 2', isActive: false },
      ];

      mockRequest.query = { active: 'false' };
      mockGetAllProviders.mockResolvedValue(mockProviders);

      await getAllProviders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllProviders).toHaveBeenCalledWith(false);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockGetAllProviders.mockRejectedValue(error);

      await getAllProviders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProviderById', () => {
    it('should return provider by id', async () => {
      const mockProvider = {
        id: 1,
        name: 'Provider 1',
        slug: 'provider-1',
        isActive: true,
      };

      mockRequest.params = { id: '1' };
      mockGetProviderById.mockResolvedValue(mockProvider);

      await getProviderById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProviderById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProvider,
      });
    });

    it('should handle provider not found', async () => {
      const error = new Error('Provider not found') as any;
      error.statusCode = 404;

      mockRequest.params = { id: '999' };
      mockGetProviderById.mockRejectedValue(error);

      await getProviderById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProviderTariffs', () => {
    it('should return tariffs for provider', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', providerId: 1 },
        { id: 2, name: 'Tariff 2', providerId: 1 },
      ];

      mockRequest.params = { id: '1' };
      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      await getProviderTariffs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetAllTariffs).toHaveBeenCalledWith({ providerId: 1 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTariffs,
      });
    });
  });

  describe('getProviderCoverage', () => {
    it('should return coverage for provider', async () => {
      const mockCoverage = [
        { providerId: 1, city: 'Москва', isAvailable: true },
      ];

      mockRequest.params = { id: '1' };
      mockGetProvidersByAddress.mockResolvedValue(mockCoverage);

      await getProviderCoverage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProvidersByAddress).toHaveBeenCalledWith('Москва');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createProvider', () => {
    it('should create new provider', async () => {
      const providerData = {
        name: 'New Provider',
        slug: 'new-provider',
        logo: 'logo.png',
        description: 'Description',
        website: 'https://example.com',
        phone: '+79991234567',
      };

      const createdProvider = {
        id: 3,
        ...providerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = providerData;
      mockCreateProvider.mockResolvedValue(createdProvider);

      await createProvider(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreateProvider).toHaveBeenCalledWith(providerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdProvider,
      });
    });
  });

  describe('updateProvider', () => {
    it('should update existing provider', async () => {
      const updateData = {
        name: 'Updated Provider',
        description: 'Updated description',
      };

      const updatedProvider = {
        id: 1,
        name: 'Updated Provider',
        description: 'Updated description',
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUpdateProvider.mockResolvedValue(updatedProvider);

      await updateProvider(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUpdateProvider).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProvider,
      });
    });
  });
});
