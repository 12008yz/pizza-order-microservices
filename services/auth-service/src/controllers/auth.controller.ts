import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const authService = new AuthService();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role } = req.body;
    // Регистрация доступна только для админов и операторов
    // По умолчанию создается админ, если role не указан
    const userRole = role === 'admin' ? 'admin' : 'admin';
    const result = await authService.register(email, password, name, userRole);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      const error = new Error('Refresh token is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const tokens = await authService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const error = new Error('Token is required') as AppError;
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };

    res.status(200).json({
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    const appError = new Error('Invalid or expired token') as AppError;
    appError.statusCode = 401;
    next(appError);
  }
};

/**
 * Создать или обновить пользователя по телефону
 * Внутренний API для использования другими сервисами
 */
export const createOrUpdateUserByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, fullName, email } = req.body;
    const user = await authService.createOrUpdateUserByPhone(phone, fullName, email);
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
