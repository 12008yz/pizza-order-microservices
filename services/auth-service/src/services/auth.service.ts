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
  async register(email: string, password: string, name: string, role: 'admin' | 'user' = 'admin') {
    // Валидация обязательных полей при регистрации
    if (!email || !password || !name) {
      const error = new Error('Email, password and name are required for registration') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User with this email already exists') as AppError;
      error.statusCode = 409;
      throw error;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Регистрация доступна только для админов и операторов
    // Обычные пользователи создаются автоматически при создании заказа с телефоном
    if (role !== 'admin') {
      const error = new Error('Registration is only available for admins and operators') as AppError;
      error.statusCode = 403;
      throw error;
    }

    // Создаем пользователя (админа или оператора)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role,
    });

    // Генерируем токены
    const tokens = this.generateTokens(user.id, user.email || '', user.role);

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
    // Валидация обязательных полей
    if (!email || !password) {
      const error = new Error('Email and password are required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
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
    const tokens = this.generateTokens(user.id, user.email || '', user.role);

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
      const tokens = this.generateTokens(user.id, user.email || '', user.role);

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

  /**
   * Создать или обновить пользователя по телефону
   * Используется при создании заказа без авторизации
   */
  async createOrUpdateUserByPhone(phone: string, fullName?: string, email?: string | null) {
    if (!phone) {
      const error = new Error('Phone number is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Нормализуем телефон (убираем пробелы, дефисы и т.д.)
    const normalizedPhone = phone.replace(/\D/g, '');

    // Ищем пользователя по телефону
    let user = await User.findOne({ where: { phone: normalizedPhone } });

    if (user) {
      // Обновляем существующего пользователя (только если переданы новые данные)
      const updateData: any = {};
      if (fullName && !user.fullName) {
        updateData.fullName = fullName;
        updateData.name = fullName; // Обновляем также name для совместимости
      } else if (fullName && user.fullName !== fullName) {
        // Обновляем только если передано новое значение
        updateData.fullName = fullName;
        updateData.name = fullName;
      }
      if (email && !user.email) {
        updateData.email = email;
      } else if (email && user.email !== email) {
        updateData.email = email;
      }
      
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
        logger.info(`User updated by phone: ${normalizedPhone}`);
      }
    } else {
      // Создаем нового пользователя
      user = await User.create({
        phone: normalizedPhone,
        fullName: fullName || null,
        email: email || null,
        password: null,
        name: fullName || null,
        role: 'user',
      });
      logger.info(`User created by phone: ${normalizedPhone}`);
    }

    return user;
  }
}




