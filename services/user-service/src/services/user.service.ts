import { UserProfile } from '../models/UserProfile';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Получить профиль оператора по userId
   * Используется для получения профиля текущего оператора
   * UserProfile используется только для операторов/админов (userId не null)
   */
  async getProfileByUserId(userId: number) {
    const profile = await UserProfile.findOne({ where: { userId } });
    return profile;
  }

  /**
   * Получить профиль оператора по номеру телефона
   * Используется только админами для управления профилями операторов
   * @deprecated - может использоваться только админами, не для обычных пользователей
   */
  async getProfileByPhoneOnly(phone: string) {
    const profile = await UserProfile.findOne({ where: { phone } });
    return profile;
  }

  /**
   * Получить или создать профиль оператора по номеру телефона
   * Используется только админами для управления профилями операторов
   * @deprecated - может использоваться только админами, не для обычных пользователей
   */
  async getProfileByPhone(phone: string) {
    let profile = await UserProfile.findOne({ where: { phone } });

    if (!profile) {
      profile = await UserProfile.create({ phone, userId: null });
      logger.info('Created profile for user (phone masked)', {
        phoneSuffix: phone.slice(-2),
      });
    }

    return profile;
  }

  /**
   * Обновить профиль оператора по номеру телефона
   * Используется только админами для управления профилями операторов
   * @deprecated - может использоваться только админами, не для обычных пользователей
   */
  async updateProfileByPhone(phone: string, data: Partial<UserProfile>) {
    let profile = await UserProfile.findOne({ where: { phone } });

    if (!profile) {
      profile = await UserProfile.create({ phone, userId: null, ...data });
      logger.info('Created and updated profile for user (phone masked)', {
        phoneSuffix: phone.slice(-2),
      });
    } else {
      await profile.update(data);
      logger.info('Updated profile for user (phone masked)', {
        phoneSuffix: phone.slice(-2),
      });
    }

    return profile;
  }
}




