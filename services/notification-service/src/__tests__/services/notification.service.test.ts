import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models';
import axios from 'axios';

// Мокируем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification for order_created', async () => {
      const mockNotification = {
        id: 1,
        type: 'order_created',
        title: 'Заявка создана',
        message: 'Ваша заявка #1 успешно создана.',
        sent: true,
        sentAt: new Date(),
        update: jest.fn().mockResolvedValue({}),
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: { id: 1, status: 'new', email: 'test@example.com' },
        },
      });

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.sendNotification({
        orderId: 1,
        type: 'order_created',
        email: 'test@example.com',
      });

      expect(Notification.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should send notification for status_changed', async () => {
      const mockNotification = {
        id: 1,
        type: 'status_changed',
        title: 'Статус заявки изменен',
        message: 'Статус вашей заявки #1 изменен',
        sent: true,
        sentAt: new Date(),
        update: jest.fn().mockResolvedValue({}),
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: { id: 1, status: 'processing', email: 'test@example.com' },
        },
      });

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.sendNotification({
        orderId: 1,
        type: 'status_changed',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const mockNotifications = [
        { id: 1, userId: 1, type: 'order_created', read: false },
        { id: 2, userId: 1, type: 'status_changed', read: true },
      ];

      (Notification.findAll as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await notificationService.getUserNotifications(1);

      expect(result).toEqual(mockNotifications);
      expect(Notification.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        read: false,
        update: jest.fn().mockResolvedValue({}),
      };

      (Notification.findOne as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead(1, 1);

      expect(mockNotification.update).toHaveBeenCalledWith({
        read: true,
        readAt: expect.any(Date),
      });
      expect(result).toBeDefined();
    });

    it('should throw error if notification not found', async () => {
      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(notificationService.markAsRead(999, 1)).rejects.toThrow(
        'Notification not found'
      );
    });
  });
});
