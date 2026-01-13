import { Response, NextFunction, Request } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

/**
 * Получить или создать профиль по номеру телефона
 * Работает без авторизации - идентификация по телефону
 * POST /api/users/profile
 * Body: { phone: string }
 */
export const getOrCreateProfileByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Базовая валидация формата телефона (минимум 10 цифр)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    const profile = await userService.getProfileByPhone(phone);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить профиль по номеру телефона
 * GET /api/users/profile?phone=...
 */
export const getProfileByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.query;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Базовая валидация формата телефона
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    const profile = await userService.getProfileByPhoneOnly(phone);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновить профиль по номеру телефона
 * PUT /api/users/profile
 * Body: { phone: string, ...otherFields }
 */
export const updateProfileByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, ...updateData } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Запрещаем изменение телефона (phone - уникальный идентификатор)
    if (updateData.phone && updateData.phone !== phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number cannot be changed',
      });
    }

    // Удаляем phone из updateData, если он там есть
    delete updateData.phone;

    const profile = await userService.updateProfileByPhone(phone, updateData);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Для админов/менеджеров - получить профиль по userId (требует авторизации)
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};




