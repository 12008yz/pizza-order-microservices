import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

const authService = new AuthService();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Регистрация админа или оператора
 * Используется только для CRM панели
 */
export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role, department } = req.body;
    const adminRole = role === 'operator' ? 'operator' : 'admin';
    const result = await authService.registerAdmin(email, password, name, adminRole, department);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Старый метод register - оставлен для обратной совместимости
 * @deprecated Используйте registerAdmin
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role, department } = req.body;
    // Регистрация доступна только для админов и операторов
    // Если role === 'operator', используем registerAdmin напрямую
    if (role === 'operator') {
      const result = await authService.registerAdmin(email, password, name, 'operator', department);
      res.status(201).json({
        success: true,
        data: result,
      });
    } else {
      // Для 'admin' или по умолчанию используем старый метод (который перенаправляет на registerAdmin)
      const result = await authService.register(email, password, name, 'admin');
      res.status(201).json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Логин админа или оператора
 * Используется только для CRM панели
 */
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Старый метод login - оставлен для обратной совместимости
 * @deprecated Используйте loginAdmin для админов
 */
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
      userType?: 'client' | 'admin';
    };

    res.status(200).json({
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        userType: decoded.userType || 'client',
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
