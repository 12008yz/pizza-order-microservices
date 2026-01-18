import { Notification } from '../models';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export interface NotificationData {
  userId?: number | null;
  orderId?: number | null;
  type: 'order_created' | 'status_changed' | 'order_confirmed';
  email?: string | null;
  phone?: string | null;
  metadata?: any;
}

export class NotificationService {
  /**
   * Отправляет уведомление
   */
  async sendNotification(data: NotificationData): Promise<Notification> {
    try {
      // Получаем данные заявки, если указан orderId
      let orderData = null;
      if (data.orderId) {
        try {
          const orderResponse = await axios.get(
            `${ORDER_SERVICE_URL}/api/orders/${data.orderId}`
          );
          if (orderResponse.data?.success) {
            orderData = orderResponse.data.data;
          }
        } catch (error: any) {
          logger.warn(`Failed to get order data: ${error.message}`);
        }
      }

      // Формируем уведомление на основе типа
      const notificationContent = this.getNotificationContent(data.type, orderData);

      // Создаем запись уведомления
      const notification = await Notification.create({
        userId: data.userId || null,
        orderId: data.orderId || null,
        type: data.type,
        title: notificationContent.title,
        message: notificationContent.message,
        email: data.email || orderData?.email || null,
        phone: data.phone || orderData?.phone || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        sent: false,
      });

      // Отправляем уведомление (пока только логируем, реальная отправка email будет позже)
      await this.sendEmail(notification);

      // Обновляем статус отправки
      await notification.update({
        sent: true,
        sentAt: new Date(),
      });

      logger.info(`Notification sent: ${notification.id} (type: ${data.type})`);

      return notification;
    } catch (error: any) {
      logger.error('Error sending notification:', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Получает содержимое уведомления на основе типа
   */
  private getNotificationContent(
    type: string,
    orderData: any
  ): { title: string; message: string } {
    const orderNumber = orderData?.id || 'N/A';
    const status = orderData?.status || '';

    switch (type) {
      case 'order_created':
        return {
          title: 'Заявка создана',
          message: `Ваша заявка #${orderNumber} успешно создана. Мы свяжемся с вами в ближайшее время.`,
        };
      case 'status_changed':
        return {
          title: 'Статус заявки изменен',
          message: `Статус вашей заявки #${orderNumber} изменен на: ${this.getStatusText(status)}`,
        };
      case 'order_confirmed':
        return {
          title: 'Заявка подтверждена',
          message: `Ваша заявка #${orderNumber} подтверждена. Ожидайте звонка от нашего специалиста.`,
        };
      default:
        return {
          title: 'Уведомление',
          message: 'У вас новое уведомление',
        };
    }
  }

  /**
   * Получает текстовое представление статуса
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      new: 'Новая',
      processing: 'В обработке',
      contacted: 'Связались',
      scheduled: 'Запланировано',
      connected: 'Подключено',
      cancelled: 'Отменено',
      rejected: 'Отклонено',
    };
    return statusMap[status] || status;
  }

  /**
   * Отправляет email уведомление
   * Пока только логирует, реальная отправка будет реализована позже
   */
  private async sendEmail(notification: Notification): Promise<void> {
    if (!notification.email) {
      logger.warn(`No email address for notification ${notification.id}`);
      return;
    }

    // TODO: Реализовать отправку email через nodemailer или email сервис
    logger.info(`Email notification would be sent to ${notification.email}`, {
      notificationId: notification.id,
      title: notification.title,
      message: notification.message,
    });

    // В будущем здесь будет реальная отправка:
    // await emailService.send({
    //   to: notification.email,
    //   subject: notification.title,
    //   text: notification.message,
    // });
  }

  /**
   * Получает уведомления пользователя
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
  }

  /**
   * Отмечает уведомление как прочитанное
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      const error = new Error('Notification not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await notification.update({
      read: true,
      readAt: new Date(),
    });

    return notification;
  }
}
