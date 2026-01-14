import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
const LOCATION_SERVICE_URL = process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';
const AVAILABILITY_SERVICE_URL = process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3006';

export class OrderService {
  async createOrder(data: {
    userId?: number | null;
    tariffId: number;
    providerId: number;
    fullName: string;
    phone: string;
    email?: string | null;
    // Адрес через ID из Location Service
    regionId?: number | null;
    cityId?: number | null;
    streetId?: number | null;
    buildingId?: number | null;
    apartmentId?: number | null;
    addressString?: string | null; // Полный адрес строкой для отображения
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

    // Проверяем доступность провайдера по адресу (если указан buildingId)
    if (data.buildingId) {
      try {
        const availabilityResponse = await axios.post(
          `${AVAILABILITY_SERVICE_URL}/api/availability/check`,
          {
            buildingId: data.buildingId,
            apartmentId: data.apartmentId,
            providerId: data.providerId,
          }
        );

        if (!availabilityResponse.data.success || !availabilityResponse.data.data?.isAvailable) {
          const error = new Error('Provider is not available at this address') as AppError;
          error.statusCode = 400;
          throw error;
        }
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          throw error;
        }
        // Если Availability Service недоступен, логируем предупреждение, но не блокируем создание заявки
        logger.warn(`Availability check failed for order: ${error.message}`);
      }
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
