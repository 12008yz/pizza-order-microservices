import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Моки уже настроены в setup.ts, просто импортируем
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Импортируем после мокирования
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import { AdminUser } from '../../models/AdminUser';
import { RefreshToken } from '../../models/RefreshToken';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new admin', async () => {
      const mockAdmin = {
        id: 1,
        email: mockUserData.email,
        name: mockUserData.name,
        role: 'admin',
        password: 'hashedPassword',
        department: null,
        isActive: true,
      };

      (AdminUser.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (AdminUser.create as jest.Mock).mockResolvedValue(mockAdmin);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (RefreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.register(
        mockUserData.email,
        mockUserData.password,
        mockUserData.name
      );

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUserData.email);
      expect(result.user.name).toBe(mockUserData.name);
      expect(AdminUser.findOne).toHaveBeenCalledWith({ where: { email: mockUserData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(AdminUser.create).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: 'hashedPassword',
        name: mockUserData.name,
        role: 'admin',
        department: null,
        isActive: true,
      });
    });

    it('should throw error if admin already exists', async () => {
      const existingAdmin = {
        id: 1,
        email: mockUserData.email,
        name: 'Existing Admin',
        role: 'admin',
      };

      (AdminUser.findOne as jest.Mock).mockResolvedValue(existingAdmin);

      await expect(
        authService.register(mockUserData.email, mockUserData.password, mockUserData.name)
      ).rejects.toThrow('Admin with this email already exists');

      expect(AdminUser.findOne).toHaveBeenCalledWith({ where: { email: mockUserData.email } });
      expect(AdminUser.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      const mockAdmin = {
        id: 1,
        email: mockUserData.email,
        name: mockUserData.name,
        role: 'admin',
        password: 'hashedPassword',
        department: null,
        isActive: true,
      };

      (AdminUser.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (AdminUser.create as jest.Mock).mockResolvedValue(mockAdmin);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (RefreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.register(
        mockUserData.email,
        mockUserData.password,
        mockUserData.name
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(AdminUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword',
        })
      );
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        name: 'Test User',
        role: 'user',
        password: 'hashedPassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (RefreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login(mockCredentials.email, mockCredentials.password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockCredentials.email);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: mockCredentials.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.password);
    });

    it('should throw error if user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login(mockCredentials.email, mockCredentials.password)
      ).rejects.toThrow('Invalid email or password');

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: mockCredentials.email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        name: 'Test User',
        role: 'user',
        password: 'hashedPassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login(mockCredentials.email, mockCredentials.password)
      ).rejects.toThrow('Invalid email or password');

      expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.password);
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'validRefreshToken';
    const mockDecoded = {
      userId: 1,
      email: 'test@example.com',
      role: 'user',
      userType: 'client',
    };

    it('should successfully refresh token with valid refresh token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const mockRefreshTokenRecord = {
        id: 1,
        userId: 1,
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshTokenRecord);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (RefreshToken.destroy as jest.Mock).mockResolvedValue(1);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');
      (RefreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.refreshToken(mockRefreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('newAccessToken');
      expect(result.refreshToken).toBe('newRefreshToken');
      expect(jwt.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.any(String) // Проверяем что передается строка (секрет)
      );
      expect(RefreshToken.findOne).toHaveBeenCalledWith({
        where: { token: mockRefreshToken, userId: mockDecoded.userId, userType: 'client' },
      });
      expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { token: mockRefreshToken } });
    });

    it('should throw error if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if refresh token is expired', async () => {
      const expiredToken = {
        id: 1,
        userId: 1,
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(expiredToken);

      // Сервис перехватывает все ошибки и выбрасывает "Invalid refresh token"
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if refresh token not found in database', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      // Сервис перехватывает все ошибки и выбрасывает "Invalid refresh token"
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if user not found', async () => {
      const mockRefreshTokenRecord = {
        id: 1,
        userId: 1,
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshTokenRecord);
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Сервис перехватывает все ошибки и выбрасывает "Invalid refresh token"
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout by destroying refresh token', async () => {
      const refreshToken = 'tokenToDestroy';

      (RefreshToken.destroy as jest.Mock).mockResolvedValue(1);

      await authService.logout(refreshToken);

      expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { token: refreshToken } });
    });
  });
});
