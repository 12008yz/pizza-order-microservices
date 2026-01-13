import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';

export class OrderService {
  async createOrder(data: {
    userId?: number | null;
    tariffId: number;
    providerId: number;
    fullName: string;
    phone: string;
    email?: string | null;
    city: string;
    street: string;
    house: string;
    building?: string | null;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    intercom?: string | null;
    preferredDate?: Date | null;
    preferredTimeFrom?: string | null;
    preferredTimeTo?: string | null;
    comment?: string | null;
    source?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
  }) {
    // Проверяем тариф через Provider Service
    try {
      const tariffResponse = await axios.get(
        `${PROVIDER_SERVICE_URL}/api/tariffs/${data.tariffId}`
      );

      if (!tariffResponse.data.success) {
        const error = new Error('Tariff not found') as AppError;
        error.statusCode = 404;
        throw error;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        const appError = new Error('Tariff not found') as AppError;
        appError.statusCode = 404;
        throw appError;
      }
      throw error;
    }

    const order = await Order.create({
      ...data,
      status: 'new',
    });

    logger.info(`Order created: ${order.id} for user ${data.userId || 'anonymous'}`);

    return order;
  }

  async getOrderById(id: number, userId?: number) {
    const where: any = { id };

    if (userId) {
      where.userId = userId;
    }

    const order = await Order.findOne({ where });

    if (!order) {
      const error = new Error('Order not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  async getUserOrders(userId: number) {
    return await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Получить заказы по номеру телефона (для обычных пользователей без userId)
   */
  async getOrdersByPhone(phone: string) {
    return await Order.findAll({
      where: { phone },
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllOrders(filters: {
    status?: string;
    providerId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt[Op.gte] = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt[Op.lte] = filters.dateTo;
      }
    }

    return await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOrderStatus(id: number, status: Order['status']) {
    const order = await Order.findByPk(id);
    if (!order) {
      const error = new Error('Order not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await order.update({ status });
    logger.info(`Order ${id} status updated to ${status}`);
    return order;
  }

  async assignOrder(id: number, assignedTo: string) {
    const order = await Order.findByPk(id);
    if (!order) {
      const error = new Error('Order not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await order.update({ assignedTo });
    logger.info(`Order ${id} assigned to ${assignedTo}`);
    return order;
  }
}
