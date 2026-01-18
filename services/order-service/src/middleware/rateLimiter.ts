import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter для создания заказов
 * Ограничивает до 5 заказов за 15 минут с одного IP
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 запросов
  message: {
    success: false,
    error: 'Too many orders, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many orders, please try again later',
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
