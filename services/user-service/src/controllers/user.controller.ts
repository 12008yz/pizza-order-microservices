import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

/**
 * Получить профиль оператора по userId (требует авторизации)
 * GET /api/users/profile
 * Только для операторов/админов - получить свой профиль
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

/**
 * Создать или обновить профиль пользователя по номеру телефона
 * POST /api/users/profile
 * Публичный эндпоинт для регистрации пользователей
 */
export const createOrUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, city, street, house, apartment, connectionType, contactMethod, savedAddresses } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Нормализуем номер телефона
    const normalizedPhone = phone.replace(/\D/g, '');

    if (normalizedPhone.length < 10 || normalizedPhone.length > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    const profileData = {
      city: city || null,
      street: street || null,
      house: house || null,
      apartment: apartment || null,
      connectionType: connectionType || null,
      contactMethod: contactMethod || null,
      savedAddresses: savedAddresses || null,
    };

    const profile = await userService.updateProfileByPhone(normalizedPhone, profileData);

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить профиль пользователя по номеру телефона
 * GET /api/users/profile/by-phone/:phone
 * Публичный эндпоинт для получения профиля
 */
export const getProfileByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    const profile = await userService.getProfileByPhoneOnly(normalizedPhone);

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
 * Обновить профиль пользователя по номеру телефона
 * PUT /api/users/profile/by-phone/:phone
 * Публичный эндпоинт для обновления профиля
 */
export const updateProfileByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.params;
    const { city, street, house, apartment, connectionType, contactMethod, savedAddresses } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const normalizedPhone = phone.replace(/\D/g, '');

    const profileData = {
      city: city || undefined,
      street: street || undefined,
      house: house || undefined,
      apartment: apartment || undefined,
      connectionType: connectionType || undefined,
      contactMethod: contactMethod || undefined,
      savedAddresses: savedAddresses || undefined,
    };

    const profile = await userService.updateProfileByPhone(normalizedPhone, profileData);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
