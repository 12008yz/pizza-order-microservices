import { Order, OrderItem, OrderStatusHistory } from '../models';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
const LOCATION_SERVICE_URL = process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';
const AVAILABILITY_SERVICE_URL = process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3006';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:3007';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export class OrderService {
  async createOrder(data: {
    userId?: number | null;
    tariffId: number;
    providerId: number;
    fullName: string;
    phone: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | null;
    citizenship?: string | null;
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
    // Оборудование
    routerOption?: string | null;
    tvSettopOption?: string | null;
    simCardOption?: string | null;
  }) {
    // Проверяем наличие телефона (обязательное поле)
    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
      const error = new Error('Phone number is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Базовая валидация формата телефона
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const normalizedPhone = data.phone.replace(/\D/g, '');
    if (!phoneRegex.test(data.phone) || normalizedPhone.length < 10) {
      const error = new Error('Invalid phone number format') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Создаем или обновляем пользователя в User таблице по телефону
    // Пользователь создается ТОЛЬКО когда введен телефон (это обязательное поле)
    let userId = data.userId;
    if (!userId) {
      try {
        const userResponse = await axios.post(
          `${AUTH_SERVICE_URL}/api/auth/internal/user-by-phone`,
          {
            phone: normalizedPhone,
            fullName: data.fullName,
            email: data.email,
          }
        );

        if (userResponse.data.success && userResponse.data.data) {
          userId = userResponse.data.data.id;
          logger.info(`User created/updated by phone: ${normalizedPhone}, userId: ${userId}`);
        } else {
          logger.warn(`Failed to create user: invalid response from auth service`);
        }
      } catch (error: any) {
        // Если не удалось создать пользователя, это критическая ошибка
        // так как телефон обязателен и пользователь должен быть создан
        logger.error(`Failed to create/update user by phone: ${error.message}`);
        const appError = new Error('Failed to create user. Please try again.') as AppError;
        appError.statusCode = 500;
        throw appError;
      }
    }

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

    // Рассчитываем стоимость перед созданием заявки (если указаны опции оборудования)
    let calculation = null;
    if (data.routerOption || data.tvSettopOption || data.simCardOption) {
      calculation = await this.calculateOrderCost({
        tariffId: data.tariffId,
        routerOption: data.routerOption,
        tvSettopOption: data.tvSettopOption,
        simCardOption: data.simCardOption,
      });
    }

    const order = await Order.create({
      ...data,
      userId: userId || null,
      status: 'new',
      ...(calculation || {}),
    });

    // Создаем запись в истории статусов
    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'new',
      changedBy: userId ? userId.toString() : 'system',
      comment: 'Заявка создана',
    });

    // Создаем элементы заявки (если есть расчет)
    if (calculation) {
      await this.createOrderItems(order.id, calculation, data.tariffId);
    }

    logger.info(`Order created: ${order.id} for user ${userId || 'anonymous'}`);

    // Отправляем уведомление о создании заявки
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        userId: userId || null,
        orderId: order.id,
        type: 'order_created',
        email: data.email || null,
        phone: data.phone || null,
      });
    } catch (error: any) {
      logger.warn(`Failed to send notification: ${error.message}`);
      // Не блокируем создание заявки, если уведомление не отправилось
    }

    return order;
  }

  /**
   * Рассчитывает стоимость заявки
   */
  async calculateOrderCost(data: {
    tariffId: number;
    routerOption?: string | null;
    tvSettopOption?: string | null;
    simCardOption?: string | null;
  }): Promise<{
    routerPrice: number | null;
    tvSettopPrice: number | null;
    simCardPrice: number | null;
    totalMonthlyPrice: number | null;
    totalConnectionPrice: number | null;
    totalEquipmentPrice: number | null;
  }> {
    let tariffPrice = 0;
    let connectionPrice = 0;
    let routerPrice = 0;
    let tvSettopPrice = 0;
    let simCardPrice = 0;

    try {
      // Получаем данные тарифа
      const tariffResponse = await axios.get(
        `${PROVIDER_SERVICE_URL}/api/tariffs/${data.tariffId}`
      );

      if (tariffResponse.data?.success && tariffResponse.data.data) {
        const tariff = tariffResponse.data.data;
        tariffPrice = parseFloat(tariff.price) || 0;
        connectionPrice = parseFloat(tariff.connectionPrice) || 0;
      }
    } catch (error: any) {
      logger.warn(`Failed to get tariff: ${error.message}`);
    }

    // Получаем цены оборудования
    if (data.routerOption && data.routerOption !== 'none') {
      try {
        // Здесь нужно получить цену роутера из Equipment Service
        // Пока используем заглушку
        routerPrice = data.routerOption === 'purchase' ? 2000 : 0;
        if (data.routerOption === 'rent') {
          routerPrice = 200; // Ежемесячная аренда
        }
      } catch (error: any) {
        logger.warn(`Failed to get router price: ${error.message}`);
      }
    }

    if (data.tvSettopOption && data.tvSettopOption !== 'none') {
      try {
        tvSettopPrice = data.tvSettopOption === 'purchase' ? 3000 : 0;
        if (data.tvSettopOption === 'rent') {
          tvSettopPrice = 300; // Ежемесячная аренда
        }
      } catch (error: any) {
        logger.warn(`Failed to get TV settop price: ${error.message}`);
      }
    }

    if (data.simCardOption && data.simCardOption !== 'none') {
      simCardPrice = 0; // SIM-карта обычно бесплатна
    }

    const totalEquipmentPrice = routerPrice + tvSettopPrice + simCardPrice;
    const monthlyEquipmentRent = 
      (data.routerOption === 'rent' ? 200 : 0) +
      (data.tvSettopOption === 'rent' ? 300 : 0);
    const totalMonthlyPrice = tariffPrice + monthlyEquipmentRent;

    return {
      routerPrice: routerPrice > 0 ? routerPrice : null,
      tvSettopPrice: tvSettopPrice > 0 ? tvSettopPrice : null,
      simCardPrice: simCardPrice > 0 ? simCardPrice : null,
      totalMonthlyPrice,
      totalConnectionPrice: connectionPrice,
      totalEquipmentPrice: totalEquipmentPrice > 0 ? totalEquipmentPrice : null,
    };
  }

  /**
   * Создает элементы заявки
   */
  private async createOrderItems(
    orderId: number,
    calculation: {
      routerPrice: number | null;
      tvSettopPrice: number | null;
      simCardPrice: number | null;
    },
    tariffId: number
  ): Promise<void> {
    try {
      // Создаем элемент для тарифа
      try {
        const tariffResponse = await axios.get(
          `${PROVIDER_SERVICE_URL}/api/tariffs/${tariffId}`
        );
        if (tariffResponse.data?.success && tariffResponse.data.data) {
          const tariff = tariffResponse.data.data;
          await OrderItem.create({
            orderId,
            itemType: 'tariff',
            itemId: tariffId,
            name: tariff.name || 'Тариф',
            quantity: 1,
            unitPrice: parseFloat(tariff.price) || 0,
            totalPrice: parseFloat(tariff.price) || 0,
          });
        }
      } catch (error: any) {
        logger.warn(`Failed to create tariff item: ${error.message}`);
      }

      // Создаем элементы для оборудования
      if (calculation.routerPrice) {
        await OrderItem.create({
          orderId,
          itemType: 'equipment',
          itemId: 0, // Можно получить из Equipment Service
          name: 'Роутер',
          quantity: 1,
          unitPrice: calculation.routerPrice,
          totalPrice: calculation.routerPrice,
        });
      }

      if (calculation.tvSettopPrice) {
        await OrderItem.create({
          orderId,
          itemType: 'equipment',
          itemId: 0,
          name: 'ТВ-приставка',
          quantity: 1,
          unitPrice: calculation.tvSettopPrice,
          totalPrice: calculation.tvSettopPrice,
        });
      }

      if (calculation.simCardPrice) {
        await OrderItem.create({
          orderId,
          itemType: 'equipment',
          itemId: 0,
          name: 'SIM-карта',
          quantity: 1,
          unitPrice: calculation.simCardPrice,
          totalPrice: calculation.simCardPrice,
        });
      }
    } catch (error: any) {
      logger.error(`Failed to create order items: ${error.message}`);
      // Не бросаем ошибку, элементы заявки не критичны
    }
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

  async updateOrderStatus(id: number, status: Order['status'], changedBy?: string, comment?: string) {
    const order = await Order.findByPk(id);
    if (!order) {
      const error = new Error('Order not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Создаем запись в истории статусов
    await OrderStatusHistory.create({
      orderId: id,
      status,
      changedBy: changedBy || 'system',
      comment: comment || `Статус изменен с ${oldStatus} на ${status}`,
    });

    logger.info(`Order ${id} status updated from ${oldStatus} to ${status}`);

    // Отправляем уведомление об изменении статуса
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        userId: order.userId,
        orderId: id,
        type: 'status_changed',
        email: order.email || null,
        phone: order.phone || null,
        metadata: { oldStatus, newStatus: status },
      });
    } catch (error: any) {
      logger.warn(`Failed to send status change notification: ${error.message}`);
    }

    return order;
  }

  /**
   * Получает историю статусов заявки
   */
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return await OrderStatusHistory.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']],
    });
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
