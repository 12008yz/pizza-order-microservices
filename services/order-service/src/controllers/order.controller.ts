import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';

const orderService = new OrderService();

export const createOrder = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Заявки можно создавать без авторизации
    const userId = req.user?.userId || null;
    const order = await orderService.createOrder({
      ...req.body,
      userId,
    });
    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const order = await orderService.getOrderById(parseInt(id), userId || undefined);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить заказы по номеру телефона (без авторизации)
 * GET /api/orders/by-phone?phone=...
 */
export const getOrdersByPhone = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let { phone } = req.query;

    // Декодируем phone из URL, если он закодирован
    if (phone && typeof phone === 'string') {
      phone = decodeURIComponent(phone);
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Базовая валидация формата телефона
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    const orders = await orderService.getOrdersByPhone(phone.trim());
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Только для админов (можно добавить проверку роли)
    const { status, providerId, dateFrom, dateTo } = req.query;
    const orders = await orderService.getAllOrders({
      status: status as string | undefined,
      providerId: providerId ? parseInt(providerId as string) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const changedBy = req.user?.userId?.toString() || 'system';
    const order = await orderService.updateOrderStatus(parseInt(id), status, changedBy, comment);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateOrderCost = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tariffId, routerOption, tvSettopOption, simCardOption } = req.body;
    
    if (!tariffId) {
      return res.status(400).json({
        success: false,
        error: 'tariffId is required',
      });
    }

    const calculation = await orderService.calculateOrderCost({
      tariffId,
      routerOption,
      tvSettopOption,
      simCardOption,
    });

    res.status(200).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatusHistory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const history = await orderService.getOrderStatusHistory(parseInt(id));
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const assignOrder = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const order = await orderService.assignOrder(parseInt(id), assignedTo);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
