import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/UserProfile';

// Моки уже настроены в setup.ts
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getProfileByUserId', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 1,
        userId: 123,
        phone: '+79991234567',
        address: 'Test Address',
        city: 'Moscow',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await userService.getProfileByUserId(123);

      expect(result).toEqual(mockProfile);
      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { userId: 123 } });
      expect(UserProfile.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when profile not found', async () => {
      (UserProfile.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.getProfileByUserId(999);

      expect(result).toBeNull();
      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { userId: 999 } });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      (UserProfile.findOne as jest.Mock).mockRejectedValue(error);

      await expect(userService.getProfileByUserId(123)).rejects.toThrow(
        'Database connection error'
      );
    });
  });

  describe('getProfileByPhoneOnly', () => {
    it('should return profile when found by phone', async () => {
      const mockProfile = {
        id: 1,
        userId: 123,
        phone: '+79991234567',
        address: 'Test Address',
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await userService.getProfileByPhoneOnly('+79991234567');

      expect(result).toEqual(mockProfile);
      expect(UserProfile.findOne).toHaveBeenCalledWith({
        where: { phone: '+79991234567' },
      });
    });

    it('should return null when profile not found by phone', async () => {
      (UserProfile.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.getProfileByPhoneOnly('+79999999999');

      expect(result).toBeNull();
    });
  });

  describe('getProfileByPhone', () => {
    it('should return existing profile when found', async () => {
      const mockProfile = {
        id: 1,
        userId: null,
        phone: '+79991234567',
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await userService.getProfileByPhone('+79991234567');

      expect(result).toEqual(mockProfile);
      expect(UserProfile.findOne).toHaveBeenCalledWith({
        where: { phone: '+79991234567' },
      });
      expect(UserProfile.create).not.toHaveBeenCalled();
    });

    it('should create new profile when not found', async () => {
      const newProfile = {
        id: 1,
        userId: null,
        phone: '+79991234567',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(null);
      (UserProfile.create as jest.Mock).mockResolvedValue(newProfile);

      const result = await userService.getProfileByPhone('+79991234567');

      expect(result).toEqual(newProfile);
      expect(UserProfile.findOne).toHaveBeenCalledWith({
        where: { phone: '+79991234567' },
      });
      expect(UserProfile.create).toHaveBeenCalledWith({
        phone: '+79991234567',
        userId: null,
      });
    });
  });

  describe('updateProfileByPhone', () => {
    it('should update existing profile', async () => {
      const existingProfile = {
        id: 1,
        userId: null,
        phone: '+79991234567',
        address: 'Old Address',
        update: jest.fn().mockResolvedValue(true),
      };

      const updateData = {
        address: 'New Address',
        city: 'Moscow',
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(existingProfile);

      const result = await userService.updateProfileByPhone('+79991234567', updateData);

      expect(existingProfile.update).toHaveBeenCalledWith(updateData);
      expect(UserProfile.findOne).toHaveBeenCalledWith({
        where: { phone: '+79991234567' },
      });
      expect(UserProfile.create).not.toHaveBeenCalled();
    });

    it('should create profile if not found and update', async () => {
      const newProfile = {
        id: 1,
        userId: null,
        phone: '+79991234567',
        address: 'New Address',
        city: 'Moscow',
      };

      const updateData = {
        address: 'New Address',
        city: 'Moscow',
      };

      (UserProfile.findOne as jest.Mock).mockResolvedValue(null);
      (UserProfile.create as jest.Mock).mockResolvedValue(newProfile);

      const result = await userService.updateProfileByPhone('+79991234567', updateData);

      expect(result).toEqual(newProfile);
      expect(UserProfile.create).toHaveBeenCalledWith({
        phone: '+79991234567',
        userId: null,
        ...updateData,
      });
    });
  });
});
