import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';

const notificationService = new NotificationService();

/**
 * POST /api/notifications
 * Отправить уведомление
 */
export const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, orderId, type, email, phone, metadata } = req.body;

    if (!type) {
      const error = new Error('Type is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const validTypes = ['order_created', 'status_changed', 'order_confirmed'];
    if (!validTypes.includes(type)) {
      const error = new Error('Invalid notification type') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const notification = await notificationService.sendNotification({
      userId: userId || null,
      orderId: orderId || null,
      type,
      email: email || null,
      phone: phone || null,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/user/:user_id
 * Получить уведомления пользователя
 */
export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      const error = new Error('User ID is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const userId = parseInt(user_id, 10);
    if (isNaN(userId)) {
      const error = new Error('Invalid user ID') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const notifications = await notificationService.getUserNotifications(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Отметить уведомление как прочитанное
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      const error = new Error('User ID is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const notificationId = parseInt(id, 10);
    if (isNaN(notificationId)) {
      const error = new Error('Invalid notification ID') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
