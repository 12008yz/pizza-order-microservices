import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode || 500;
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
