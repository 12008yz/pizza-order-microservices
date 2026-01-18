import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err?.message || (typeof err === 'string' ? err : 'Internal Server Error');

  // Улучшенное логирование ошибок
  logger.error('Request error', {
    error: message,
    stack: err?.stack,
    path: req.path,
    method: req.method,
    statusCode,
    errorType: err?.constructor?.name || typeof err,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
