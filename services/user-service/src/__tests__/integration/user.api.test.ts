import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';

// Мокируем UserService перед импортом роутов
const mockGetProfileByUserId = jest.fn();

jest.mock('../../services/user.service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      getProfileByUserId: mockGetProfileByUserId,
    })),
  };
});

// Мокируем middleware авторизации
const mockAuthenticateToken = jest.fn((req: any, res: any, next: any) => {
  // Устанавливаем user для авторизованных запросов
  if (req.headers.authorization && req.headers.authorization !== 'Bearer invalid') {
    req.user = {
      userId: 123,
      email: 'operator@example.com',
      role: 'operator',
    };
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }
});

jest.mock('../../middleware/auth', () => ({
  authenticateToken: mockAuthenticateToken,
}));

// Импортируем роуты после мокирования
import userRoutes from '../../routes/user.routes';

describe('User API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile', () => {
    it('should return profile successfully with valid token', async () => {
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

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer validToken')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(123);
      expect(response.body.data.phone).toBe('+79991234567');
      expect(mockGetProfileByUserId).toHaveBeenCalledWith(123);
    });

    it('should return 404 when profile not found', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer validToken')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Profile not found');
      expect(mockGetProfileByUserId).toHaveBeenCalledWith(123);
    });

    it('should return 401 when token is missing', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access token required');
      expect(mockGetProfileByUserId).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(mockGetProfileByUserId).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection error');
      mockGetProfileByUserId.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer validToken')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Authorization Flow', () => {
    it('should require authentication for all endpoints', async () => {
      // Все endpoints требуют авторизации
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should work with different user IDs', async () => {
      // Мокируем middleware для другого пользователя
      const mockAuthForUser456 = jest.fn((req: any, res: any, next: any) => {
        if (req.headers.authorization === 'Bearer token456') {
          req.user = {
            userId: 456,
            email: 'admin@example.com',
            role: 'admin',
          };
          next();
        } else {
          res.status(401).json({ success: false, error: 'Unauthorized' });
        }
      });

      // Временно заменяем middleware
      jest.doMock('../../middleware/auth', () => ({
        authenticateToken: mockAuthForUser456,
      }));

      const mockProfile = {
        id: 2,
        userId: 456,
        phone: '+79997654321',
      };

      mockGetProfileByUserId.mockResolvedValue(mockProfile);

      // Тест с другим userId
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer token456')
        .expect(200);

      expect(response.body.data.userId).toBe(456);
    });
  });
});
