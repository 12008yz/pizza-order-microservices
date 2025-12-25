import { Order, OrderItem } from '../models';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

export class OrderService {
  async createOrder(
    userId: number,
    items: Array<{ productId: number; quantity: number }>,
    deliveryAddress?: string,
    phone?: string
  ) {
    // Проверяем продукты через Product Service
    const productIds = items.map((item) => item.productId);

    // Получаем информацию о продуктах для расчета суммы
    let totalAmount = 0;
    const orderItems: Array<{ productId: number; quantity: number; price: number }> = [];

    for (const item of items) {
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
      );

      if (productResponse.data.success) {
        const product = productResponse.data.data;
        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: parseFloat(product.price),
        });
      } else {
        const error = new Error(`Product ${item.productId} not found`) as AppError;
        error.statusCode = 404;
        throw error;
      }
    }

    // Создаем заказ
    const order = await Order.create({
      userId,
      totalAmount,
      status: 'pending',
      deliveryAddress,
      phone,
    });

    // Создаем элементы заказа
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Загружаем заказ с элементами
    const orderWithItems = await this.getOrderById(order.id, userId);

    logger.info(`Order created: ${order.id} for user ${userId}`);

    return orderWithItems;
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [{ model: OrderItem, as: 'items' }],
    });

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
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOrderStatus(orderId: number, userId: number, status: Order['status']) {
    const order = await this.getOrderById(orderId, userId);
    await order.update({ status });
    logger.info(`Order ${orderId} status updated to ${status}`);
    return order;
  }
}

