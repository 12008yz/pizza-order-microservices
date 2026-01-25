import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter для регистрации
 * Ограничивает до 3 попыток регистрации за 15 минут с одного IP
 */
export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 3, // максимум 3 попытки
  message: {
    success: false,
    error: 'Too many registration attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many registration attempts, please try again later',
    });
  },
});

/**
 * Rate limiter для логина
 * Ограничивает до 5 попыток входа за 15 минут
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts, please try again later',
    });
  },
});

/**
 * Rate limiter для общих API запросов
 * Ограничивает до 100 запросов за 15 минут
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  standardHeaders: true,
  legacyHeaders: false,
});
