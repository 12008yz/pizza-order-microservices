import { Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { AuthRequest } from '../../middleware/auth';

// Мокируем UserService перед импортом контроллера
const mockGetProfileByUserId = jest.fn();

jest.mock('../../services/user.service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      getProfileByUserId: mockGetProfileByUserId,
    })),
  };
});

// Импортируем контроллер после мокирования
import { getProfile } from '../../controllers/user.controller';

describe('UserController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 123,
        email: 'operator@example.com',
        role: 'operator',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile successfully', async () => {
      const mockProfile = {
        id: 1,
        userId: 123,
        phone: '+79991234567',
        address: 'Test Address',
        city: 'Moscow',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetProfileByUserId.mockResolvedValue(mockProfile);

      await getProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProfileByUserId).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when profile not found', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      await getProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProfileByUserId).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Profile not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockGetProfileByUserId.mockRejectedValue(error);

      await getProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProfileByUserId).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should use userId from request.user', async () => {
      const mockProfile = {
        id: 1,
        userId: 456,
        phone: '+79991234567',
      };

      mockRequest.user = {
        userId: 456,
        email: 'admin@example.com',
        role: 'admin',
      };

      mockGetProfileByUserId.mockResolvedValue(mockProfile);

      await getProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetProfileByUserId).toHaveBeenCalledWith(456);
    });
  });
});
