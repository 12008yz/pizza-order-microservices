import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from './errorHandler';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const error = new Error('Access token required') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Валидируем токен через Auth Service
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      req.user = response.data.user;
      next();
    } catch (error) {
      const appError = new Error('Invalid or expired token') as AppError;
      appError.statusCode = 401;
      throw appError;
    }
  } catch (error) {
    next(error);
  }
};

