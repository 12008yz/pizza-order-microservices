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
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(parseInt(id), status);
    res.status(200).json({
      success: true,
      data: order,
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
