import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  assignOrder,
} from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Создание заявки доступно без авторизации
router.post('/', createOrder);

// Получение всех заявок (для админов) - требует авторизации
router.get('/', authenticateToken, getAllOrders);

// Мои заявки (требует авторизации)
router.get('/my', authenticateToken, getMyOrders);

// Детали заявки - без авторизации (можно добавить проверку прав)
router.get('/:id', getOrderById);

// Обновление статуса (для админов) - требует авторизации
router.put('/:id/status', authenticateToken, updateOrderStatus);

// Назначение менеджера (для админов) - требует авторизации
router.put('/:id/assign', authenticateToken, assignOrder);

export default router;
