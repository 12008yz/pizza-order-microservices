import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  assignOrder,
  getOrdersByPhone,
  calculateOrderCost,
  getOrderStatusHistory,
} from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Создание заявки доступно без авторизации
router.post('/', createOrder);

// Получение всех заявок (для админов) - требует авторизации
router.get('/', authenticateToken, getAllOrders);

// Мои заявки (требует авторизации) - для админов/менеджеров по userId
router.get('/my', authenticateToken, getMyOrders);

// Получение заказов по телефону (без авторизации) - для обычных пользователей
// ВАЖНО: Должен быть ПЕРЕД /:id, иначе /by-phone будет интерпретироваться как /:id
router.get('/by-phone', getOrdersByPhone);

// Расчет стоимости заявки - без авторизации
router.post('/calculate', calculateOrderCost);

// Детали заявки - без авторизации (можно добавить проверку прав)
router.get('/:id', getOrderById);

// История статусов заявки - без авторизации
router.get('/:id/status-history', getOrderStatusHistory);

// Обновление статуса (для админов) - требует авторизации
router.put('/:id/status', authenticateToken, updateOrderStatus);

// Назначение менеджера (для админов) - требует авторизации
router.put('/:id/assign', authenticateToken, assignOrder);

export default router;
