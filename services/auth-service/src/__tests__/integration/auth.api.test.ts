import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';

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

// Мокируем AuthService перед импортом роутов
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

// Импортируем jwt после мокирования
import jwt from 'jsonwebtoken';

// Импортируем роуты после мокирования
import authRoutes from '../../routes/auth.routes';

describe('Auth API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
    
    // Сбрасываем моки jwt
    mockJwtVerify.mockClear();
    mockJwtSign.mockClear();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockResult = {
        user: {
          id: 1,
          email: userData.email,
          name: userData.name,
          role: 'user',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRegister.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(mockRegister).toHaveBeenCalledWith(
        userData.email,
        userData.password,
        userData.name
      );
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      const error = new Error('User with this email already exists') as any;
      error.statusCode = 409;

      mockRegister.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 1,
          email: credentials.email,
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockLogin.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid email or password') as any;
      error.statusCode = 401;

      mockLogin.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid email or password');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'validRefreshToken';
      const mockResult = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockRefreshToken.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(mockRefreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Refresh token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'tokenToDestroy';

      mockLogout.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
      expect(mockLogout).toHaveBeenCalledWith(refreshToken);
    });

    it('should logout successfully even without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify token successfully', async () => {
      const mockDecoded = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
      };

      const token = 'validToken';

      mockJwtSign.mockReturnValue(token);
      mockJwtVerify.mockReturnValue(mockDecoded);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(mockDecoded.userId);
      expect(response.body.user.email).toBe(mockDecoded.email);
    });

    it('should return 401 if token is missing', async () => {
      // Мокируем jwt.verify чтобы он не вызывался
      mockJwtVerify.mockClear();

      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      // Проверяем что ошибка связана с отсутствием токена
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 if token is invalid', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidToken')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid or expired token');
    });
  });

  describe('Full Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Register
      const userData = {
        email: 'flowtest@example.com',
        password: 'password123',
        name: 'Flow Test User',
      };

      const registerResult = {
        user: {
          id: 1,
          email: userData.email,
          name: userData.name,
          role: 'user',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRegister.mockResolvedValue(registerResult);

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // 2. Login
      const loginResult = {
        user: registerResult.user,
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockLogin.mockResolvedValue(loginResult);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // 3. Verify Token
      const mockDecoded = {
        userId: 1,
        email: userData.email,
        role: 'user',
      };

      mockJwtVerify.mockReturnValue(mockDecoded);

      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${loginResult.accessToken}`)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // 4. Refresh Token
      const refreshResult = {
        accessToken: 'refreshedAccessToken',
        refreshToken: 'refreshedRefreshToken',
      };

      mockRefreshToken.mockResolvedValue(refreshResult);

      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: loginResult.refreshToken })
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);

      // 5. Logout
      mockLogout.mockResolvedValue(undefined);

      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: refreshResult.refreshToken })
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);
    });
  });
});
