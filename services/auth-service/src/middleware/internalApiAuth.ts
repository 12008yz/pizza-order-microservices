import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Middleware для защиты внутренних API endpoints
 * Проверяет наличие и валидность API ключа в заголовке X-Internal-Api-Key
 */
export const requireInternalApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-internal-api-key'] as string;
  const expectedApiKey = process.env.INTERNAL_API_KEY;

  // Если ключ не установлен в env, пропускаем проверку (для разработки)
  // В production обязательно должен быть установлен INTERNAL_API_KEY
  if (!expectedApiKey) {
    console.warn('WARNING: INTERNAL_API_KEY is not set. Internal API endpoints are unprotected!');
    return next();
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    const error = new Error('Invalid or missing internal API key') as AppError;
    error.statusCode = 401;
    return next(error);
  }

  next();
};
