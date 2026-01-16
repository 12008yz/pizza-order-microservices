import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    userType: 'client' | 'admin';
  };
}

/**
 * Middleware для проверки, что пользователь является админом или оператором
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token is required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
      userType?: 'client' | 'admin';
    };

    // Проверяем, что это админ или оператор
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    // Добавляем информацию о пользователе в request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      userType: decoded.userType || 'admin',
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware для проверки, что пользователь является именно админом (не оператором)
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  requireAdmin(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Super admin access required',
      });
    }
    next();
  });
};
