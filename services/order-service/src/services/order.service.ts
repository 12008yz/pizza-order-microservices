import { Order, OrderItem, OrderStatusHistory } from '../models';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { createHttpClient, callService } from '../utils/httpClient';
import {
  HTTP_TIMEOUT,
  PHONE_REGEX,
  PHONE_MIN_LENGTH,
  ROUTER_PURCHASE_PRICE,
  ROUTER_RENT_PRICE,
  TV_SETTOP_PURCHASE_PRICE,
  TV_SETTOP_RENT_PRICE,
  SIM_CARD_PRICE,
} from '../config/constants';
import {
  CreateOrderData,
  OrderCalculation,
  CalculateOrderCostData,
  OrderFilters,
  OrderItemCalculation,
} from '../types/order.types';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
const LOCATION_SERVICE_URL = process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';
const AVAILABILITY_SERVICE_URL = process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3006';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:3007';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Создаем HTTP клиенты для каждого сервиса
const providerClient = createHttpClient(PROVIDER_SERVICE_URL, HTTP_TIMEOUT);
const authClient = createHttpClient(AUTH_SERVICE_URL, HTTP_TIMEOUT);
const availabilityClient = createHttpClient(AVAILABILITY_SERVICE_URL, HTTP_TIMEOUT);
const notificationClient = createHttpClient(NOTIFICATION_SERVICE_URL, HTTP_TIMEOUT);

export class OrderService {
  /**
   * Создает новый заказ
   * @param data - Данные заказа
   * @returns Созданный заказ
   * @throws {AppError} Если телефон не указан, тариф не найден или произошла ошибка при создании
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    // Проверяем наличие телефона (обязательное поле)
    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
      const error = new Error('Phone number is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Базовая валидация формата телефона
    const normalizedPhone = data.phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(data.phone) || normalizedPhone.length < PHONE_MIN_LENGTH) {
      const error = new Error('Invalid phone number format') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Параллельно создаем пользователя и проверяем тариф
    let userId = data.userId;
    
    const [userResponse, tariffResponse] = await Promise.allSettled([
      // Создаем или обновляем пользователя
      !userId
        ? authClient.post('/api/auth/internal/user-by-phone', {
            phone: normalizedPhone,
            fullName: data.fullName,
            email: data.email,
          })
        : Promise.resolve(null),
      // Проверяем тариф
      providerClient.get(`/api/tariffs/${data.tariffId}`),
    ]);

    // Обрабатываем результат создания пользователя
    if (!userId) {
      if (userResponse.status === 'fulfilled' && userResponse.value?.data?.success) {
        userId = userResponse.value.data.data.id;
        logger.info('User created/updated by phone', {
          phone: normalizedPhone,
          userId,
        });
      } else {
        const errorMessage = userResponse.status === 'rejected' 
          ? userResponse.reason?.message 
          : 'Invalid response from auth service';
        logger.error('Failed to create/update user by phone', { error: errorMessage });
        const appError = new Error('Failed to create user. Please try again.') as AppError;
        appError.statusCode = 500;
        throw appError;
      }
    }

    // Обрабатываем результат проверки тарифа
    if (tariffResponse.status === 'rejected') {
      const error = tariffResponse.reason;
      if (error?.response?.status === 404) {
        const appError = new Error('Tariff not found') as AppError;
        appError.statusCode = 404;
        throw appError;
      }
      throw error;
    }

    if (!tariffResponse.value?.data?.success) {
      const error = new Error('Tariff not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Проверяем доступность провайдера по адресу (если указан buildingId)
    if (data.buildingId) {
      await callService(
        async () => {
          const availabilityResponse = await availabilityClient.post('/api/availability/check', {
            buildingId: data.buildingId,
            apartmentId: data.apartmentId,
            providerId: data.providerId,
          });

          if (!availabilityResponse.data.success || !availabilityResponse.data.data?.isAvailable) {
            const error = new Error('Provider is not available at this address') as AppError;
            error.statusCode = 400;
            throw error;
          }
        },
        undefined,
        'Availability check failed'
      ).catch((error: any) => {
        if (error.response?.status === 400 || error.response?.status === 404) {
          throw error;
        }
        // Если Availability Service недоступен, логируем предупреждение, но не блокируем создание заявки
        logger.warn('Availability check failed for order', { error: error.message });
      });
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

    // Используем транзакцию для атомарности операций
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.create(
        {
          ...data,
          userId: userId || null,
          status: 'new',
          ...(calculation || {}),
        },
        { transaction }
      );

      // Создаем запись в истории статусов
      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: 'new',
          changedBy: userId ? userId.toString() : 'system',
          comment: 'Заявка создана',
        },
        { transaction }
      );

      // Создаем элементы заявки (если есть расчет)
      if (calculation) {
        await this.createOrderItems(order.id, calculation, data.tariffId, transaction);
      }

      // Коммитим транзакцию
      await transaction.commit();

      logger.info('Order created', {
        orderId: order.id,
        userId: userId || 'anonymous',
        status: order.status,
      });

      // Отправляем уведомление о создании заявки (не блокируем, если не отправится)
      callService(
        async () => {
          await notificationClient.post('/api/notifications', {
            userId: userId || null,
            orderId: order.id,
            type: 'order_created',
            email: data.email || null,
            phone: data.phone || null,
          });
        },
        undefined,
        'Failed to send notification'
      ).catch(() => {
        // Уже залогировано в callService
      });

      return order;
    } catch (error: any) {
      // Откатываем транзакцию при ошибке
      await transaction.rollback();
      logger.error('Failed to create order', {
        error: error.message,
        userId: userId || 'anonymous',
      });
      throw error;
    }
  }

  /**
   * Рассчитывает стоимость заявки
   * @param data - Данные для расчета (тариф и опции оборудования)
   * @returns Расчет стоимости заказа
   */
  async calculateOrderCost(data: CalculateOrderCostData): Promise<OrderCalculation> {
    let tariffPrice = 0;
    let connectionPrice = 0;
    let routerPrice = 0;
    let tvSettopPrice = 0;
    let simCardPrice = 0;

    try {
      // Получаем данные тарифа
      const tariffResponse = await providerClient.get(`/api/tariffs/${data.tariffId}`);

      if (tariffResponse.data?.success && tariffResponse.data.data) {
        const tariff = tariffResponse.data.data;
        tariffPrice = parseFloat(tariff.price) || 0;
        connectionPrice = parseFloat(tariff.connectionPrice) || 0;
      }
    } catch (error: any) {
      logger.warn('Failed to get tariff', { error: error.message });
    }

    // Получаем цены оборудования
    if (data.routerOption && data.routerOption !== 'none') {
      try {
        // Здесь нужно получить цену роутера из Equipment Service
        // Пока используем константы
        routerPrice = data.routerOption === 'purchase' ? ROUTER_PURCHASE_PRICE : 0;
        if (data.routerOption === 'rent') {
          routerPrice = ROUTER_RENT_PRICE; // Ежемесячная аренда
        }
      } catch (error: any) {
        logger.warn('Failed to get router price', { error: error.message });
      }
    }

    if (data.tvSettopOption && data.tvSettopOption !== 'none') {
      try {
        tvSettopPrice = data.tvSettopOption === 'purchase' ? TV_SETTOP_PURCHASE_PRICE : 0;
        if (data.tvSettopOption === 'rent') {
          tvSettopPrice = TV_SETTOP_RENT_PRICE; // Ежемесячная аренда
        }
      } catch (error: any) {
        logger.warn('Failed to get TV settop price', { error: error.message });
      }
    }

    if (data.simCardOption && data.simCardOption !== 'none') {
      simCardPrice = SIM_CARD_PRICE; // SIM-карта обычно бесплатна
    }

    const totalEquipmentPrice = routerPrice + tvSettopPrice + simCardPrice;
    const monthlyEquipmentRent = 
      (data.routerOption === 'rent' ? ROUTER_RENT_PRICE : 0) +
      (data.tvSettopOption === 'rent' ? TV_SETTOP_RENT_PRICE : 0);
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
   * @param orderId - ID заказа
   * @param calculation - Расчет стоимости оборудования
   * @param tariffId - ID тарифа
   * @param transaction - Транзакция БД (опционально)
   */
  private async createOrderItems(
    orderId: number,
    calculation: OrderItemCalculation,
    tariffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Создаем элемент для тарифа
      try {
        const tariffResponse = await providerClient.get(`/api/tariffs/${tariffId}`);
        if (tariffResponse.data?.success && tariffResponse.data.data) {
          const tariff = tariffResponse.data.data;
          await OrderItem.create(
            {
              orderId,
              itemType: 'tariff',
              itemId: tariffId,
              name: tariff.name || 'Тариф',
              quantity: 1,
              unitPrice: parseFloat(tariff.price) || 0,
              totalPrice: parseFloat(tariff.price) || 0,
            },
            { transaction }
          );
        }
      } catch (error: any) {
        logger.warn('Failed to create tariff item', { error: error.message });
      }

      // Создаем элементы для оборудования
      if (calculation.routerPrice) {
        await OrderItem.create(
          {
            orderId,
            itemType: 'equipment',
            itemId: 0, // Можно получить из Equipment Service
            name: 'Роутер',
            quantity: 1,
            unitPrice: calculation.routerPrice,
            totalPrice: calculation.routerPrice,
          },
          { transaction }
        );
      }

      if (calculation.tvSettopPrice) {
        await OrderItem.create(
          {
            orderId,
            itemType: 'equipment',
            itemId: 0,
            name: 'ТВ-приставка',
            quantity: 1,
            unitPrice: calculation.tvSettopPrice,
            totalPrice: calculation.tvSettopPrice,
          },
          { transaction }
        );
      }

      if (calculation.simCardPrice) {
        await OrderItem.create(
          {
            orderId,
            itemType: 'equipment',
            itemId: 0,
            name: 'SIM-карта',
            quantity: 1,
            unitPrice: calculation.simCardPrice,
            totalPrice: calculation.simCardPrice,
          },
          { transaction }
        );
      }
    } catch (error: any) {
      logger.error('Failed to create order items', { error: error.message });
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

  /**
   * Получает все заказы с фильтрами
   * @param filters - Фильтры для поиска заказов
   * @returns Список заказов
   */
  async getAllOrders(filters: OrderFilters = {}): Promise<Order[]> {
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

    // Отправляем уведомление об изменении статуса (не блокируем, если не отправится)
    callService(
      async () => {
        await notificationClient.post('/api/notifications', {
          userId: order.userId,
          orderId: id,
          type: 'status_changed',
          email: order.email || null,
          phone: order.phone || null,
          metadata: { oldStatus, newStatus: status },
        });
      },
      undefined,
      'Failed to send status change notification'
    ).catch(() => {
      // Уже залогировано в callService
    });

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
