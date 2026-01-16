import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';

// Мокируем jwt ПЕРЕД импортом
const mockJwtVerify = jest.fn();
const mockJwtSign = jest.fn();

jest.mock('jsonwebtoken', () => ({
  default: {
    verify: mockJwtVerify,
    sign: mockJwtSign,
  },
  verify: mockJwtVerify,
  sign: mockJwtSign,
}));

// Мокируем AuthService перед импортом контроллера
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockRefreshToken = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../services/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      register: mockRegister,
      login: mockLogin,
      refreshToken: mockRefreshToken,
      logout: mockLogout,
    })),
  };
});

// Импортируем контроллеры после мокирования
import { register, login, refreshToken, logout, verifyToken } from '../../controllers/auth.controller';
import jwt from 'jsonwebtoken';

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Очищаем все моки
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockResult = {
        user: {
          id: 1,
          email: mockUserData.email,
          name: mockUserData.name,
          role: 'user',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRequest.body = mockUserData;
      mockRegister.mockResolvedValue(mockResult);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRegister).toHaveBeenCalledWith(
        mockUserData.email,
        mockUserData.password,
        mockUserData.name,
        'admin'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle registration error', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const error = new Error('User already exists') as AppError;
      error.statusCode = 409;

      mockRequest.body = mockUserData;
      mockRegister.mockRejectedValue(error);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRegister).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 1,
          email: mockCredentials.email,
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRequest.body = mockCredentials;
      mockLogin.mockResolvedValue(mockResult);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogin).toHaveBeenCalledWith(
        mockCredentials.email,
        mockCredentials.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;

      mockRequest.body = mockCredentials;
      mockLogin.mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogin).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const tokenValue = 'validRefreshToken';
      const mockResult = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockRequest.body = { refreshToken: tokenValue };
      mockRefreshToken.mockResolvedValue(mockResult);

      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRefreshToken).toHaveBeenCalledWith(tokenValue);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if refresh token is missing', async () => {
      mockRequest.body = {};

      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Refresh token is required');
      expect(error.statusCode).toBe(400);
    });

    it('should handle refresh token error', async () => {
      const tokenValue = 'invalidToken';
      const error = new Error('Invalid refresh token') as AppError;
      error.statusCode = 401;

      mockRequest.body = { refreshToken: tokenValue };
      mockRefreshToken.mockRejectedValue(error);

      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRefreshToken).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should logout successfully with refresh token', async () => {
      const tokenValue = 'tokenToDestroy';

      mockRequest.body = { refreshToken: tokenValue };
      mockLogout.mockResolvedValue(undefined);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogout).toHaveBeenCalledWith(tokenValue);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should logout successfully without refresh token', async () => {
      mockRequest.body = {};

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogout).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('verifyToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret-key';
      mockJwtVerify.mockClear();
    });

    it('should verify token successfully', async () => {
      const mockToken = 'validToken';
      const mockDecoded = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        userType: 'client',
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockJwtVerify.mockReturnValue(mockDecoded);

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtVerify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        user: {
          userId: mockDecoded.userId,
          email: mockDecoded.email,
          role: mockDecoded.role,
          userType: mockDecoded.userType,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is missing', async () => {
      mockRequest.headers = {};

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      // Контроллер выбрасывает "Invalid or expired token" при отсутствии токена
      // из-за того, что token будет undefined и jwt.verify выбросит ошибку
      expect(error.statusCode).toBe(401);
      expect(error.message).toBeDefined();
    });

    it('should return 401 if token is invalid', async () => {
      const mockToken = 'invalidToken';

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Invalid or expired token');
      expect(error.statusCode).toBe(401);
    });
  });
});
