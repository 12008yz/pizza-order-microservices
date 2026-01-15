import { Response, NextFunction } from 'express';
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




