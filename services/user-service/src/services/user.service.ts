import { UserProfile } from '../models/UserProfile';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserService {
  async getProfile(userId: number) {
    let profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      profile = await UserProfile.create({ userId });
      logger.info(`Created profile for user ${userId}`);
    }

    return profile;
  }

  async updateProfile(userId: number, data: Partial<UserProfile>) {
    let profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      profile = await UserProfile.create({ userId, ...data });
    } else {
      await profile.update(data);
    }

    logger.info(`Updated profile for user ${userId}`);

    return profile;
  }

  async getUserById(userId: number) {
    const profile = await UserProfile.findOne({ where: { userId } });
    return profile;
  }
}



