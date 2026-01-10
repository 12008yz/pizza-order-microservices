import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export class AuthService {
  async register(email: string, password: string, name: string) {
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User with this email already exists') as AppError;
      error.statusCode = 409;
      throw error;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
    });

    // Генерируем токены
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Сохраняем refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    logger.info(`User registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    // Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Генерируем токены
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Сохраняем refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      // Проверяем refresh token
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
        userId: number;
        email: string;
        role: string;
      };

      // Проверяем, существует ли токен в БД
      const refreshTokenRecord = await RefreshToken.findOne({
        where: { token, userId: decoded.userId },
      });

      if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
        const error = new Error('Invalid or expired refresh token') as AppError;
        error.statusCode = 401;
        throw error;
      }

      // Находим пользователя
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        const error = new Error('User not found') as AppError;
        error.statusCode = 404;
        throw error;
      }

      // Генерируем новые токены
      const tokens = this.generateTokens(user.id, user.email, user.role);

      // Удаляем старый refresh token и сохраняем новый
      await RefreshToken.destroy({ where: { token } });
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      const appError = new Error('Invalid refresh token') as AppError;
      appError.statusCode = 401;
      throw appError;
    }
  }

  async logout(token: string) {
    await RefreshToken.destroy({ where: { token } });
    logger.info('User logged out');
  }

  private generateTokens(userId: number, email: string, role: string) {
    const accessToken = jwt.sign({ userId, email, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId, email, role }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await RefreshToken.create({
      userId,
      token,
      expiresAt,
    });
  }
}




