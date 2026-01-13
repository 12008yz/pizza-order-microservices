import { UserProfile } from '../models/UserProfile';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Получить или создать профиль по номеру телефона
   * Профиль создаётся автоматически при первом вводе телефона
   */
  async getProfileByPhone(phone: string) {
    let profile = await UserProfile.findOne({ where: { phone } });

    if (!profile) {
      profile = await UserProfile.create({ phone, userId: null });
      logger.info(`Created profile for phone: ${phone}`);
    }

    return profile;
  }

  /**
   * Обновить профиль по номеру телефона
   */
  async updateProfileByPhone(phone: string, data: Partial<UserProfile>) {
    let profile = await UserProfile.findOne({ where: { phone } });

    if (!profile) {
      profile = await UserProfile.create({ phone, userId: null, ...data });
      logger.info(`Created and updated profile for phone: ${phone}`);
    } else {
      await profile.update(data);
      logger.info(`Updated profile for phone: ${phone}`);
    }

    return profile;
  }

  /**
   * Получить профиль по номеру телефона
   */
  async getProfileByPhoneOnly(phone: string) {
    const profile = await UserProfile.findOne({ where: { phone } });
    return profile;
  }

  /**
   * Для админов/менеджеров - получить профиль по userId
   */
  async getProfileByUserId(userId: number) {
    const profile = await UserProfile.findOne({ where: { userId } });
    return profile;
  }
}




