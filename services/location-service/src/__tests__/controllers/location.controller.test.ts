import { Request, Response, NextFunction } from 'express';
import * as locationController from '../../controllers/location.controller';
import { LocationService } from '../../services/location.service';

// Мокируем LocationService
jest.mock('../../services/location.service');

describe('LocationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getAllRegions', () => {
    it('should return all regions', async () => {
      const mockRegions = [
        { id: 1, name: 'Московская область' },
        { id: 2, name: 'Ленинградская область' },
      ];

      (LocationService.prototype.getAllRegions as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockRegions);

      await locationController.getAllRegions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRegions,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (LocationService.prototype.getAllRegions as jest.Mock) = jest
        .fn()
        .mockRejectedValue(error);

      await locationController.getAllRegions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getCitiesByRegion', () => {
    it('should return cities for a region', async () => {
      mockRequest.query = { region_id: '1' };
      const mockCities = [
        { id: 1, name: 'Москва', regionId: 1 },
        { id: 2, name: 'Подольск', regionId: 1 },
      ];

      (LocationService.prototype.getCitiesByRegion as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockCities);

      await locationController.getCitiesByRegion(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCities,
      });
    });

    it('should return 400 if region_id is missing', async () => {
      mockRequest.query = {};

      await locationController.getCitiesByRegion(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
