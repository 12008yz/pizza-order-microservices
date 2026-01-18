import { Request, Response, NextFunction } from 'express';

// Мокируем AvailabilityService ПЕРЕД импортом контроллера
const mockCheckAvailability = jest.fn();
const mockGetProvidersByAddressId = jest.fn();

jest.mock('../../services/availability.service', () => {
  return {
    AvailabilityService: jest.fn().mockImplementation(() => ({
      checkAvailability: mockCheckAvailability,
      getProvidersByAddressId: mockGetProvidersByAddressId,
    })),
  };
});

// Импортируем контроллер ПОСЛЕ мока
import {
  checkAvailability,
  getAvailabilityByAddressId,
  getProvidersByAddressId,
} from '../../controllers/availability.controller';

describe('AvailabilityController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should check availability with valid address', async () => {
      mockRequest.body = {
        city: 'Москва',
        street: 'Тверская',
        house: 10,
      };

      mockCheckAvailability.mockResolvedValue([
        { providerId: 1, providerName: 'Provider 1', isAvailable: true },
      ]);

      await checkAvailability(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCheckAvailability).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [{ providerId: 1, providerName: 'Provider 1', isAvailable: true }],
      });
    });

    it('should return 400 if city is missing', async () => {
      mockRequest.body = {
        street: 'Тверская',
      };

      await checkAvailability(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });
  });

  describe('getAvailabilityByAddressId', () => {
    it('should get availability by buildingId', async () => {
      mockRequest.params = { address_id: '123' };
      mockRequest.query = { type: 'building' };

      mockGetProvidersByAddressId.mockResolvedValue([
        { providerId: 1, providerName: 'Provider 1', isAvailable: true },
      ]);

      await getAvailabilityByAddressId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProvidersByAddressId).toHaveBeenCalledWith(123, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should get availability by apartmentId', async () => {
      mockRequest.params = { address_id: '456' };
      mockRequest.query = { type: 'apartment' };

      mockGetProvidersByAddressId.mockResolvedValue([
        { providerId: 1, providerName: 'Provider 1', isAvailable: true },
      ]);

      await getAvailabilityByAddressId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProvidersByAddressId).toHaveBeenCalledWith(undefined, 456);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if address_id is invalid', async () => {
      mockRequest.params = { address_id: 'invalid' };

      await getAvailabilityByAddressId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });
  });
});
