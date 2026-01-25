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
import { validateCreateOrder, validateUpdateOrderStatus } from '../utils/validators';
import { orderLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Применяем общий rate limiter ко всем роутам
router.use(apiLimiter);

// Создание заявки доступно без авторизации, но с валидацией и специальным rate limiter
router.post('/', orderLimiter, validateCreateOrder, createOrder);

// Получение всех заявок (для админов) - требует авторизации
router.get('/', authenticateToken, getAllOrders);

// Мои заявки (требует авторизации) - для админов/менеджеров по userId
router.get('/my', authenticateToken, getMyOrders);

// Получение заказов по телефону (без авторизации) - для обычных пользователей
// ВАЖНО: Должен быть ПЕРЕД /:id, иначе /by-phone будет интерпретироваться как /:id
router.get('/by-phone', getOrdersByPhone);

// Расчет стоимости заявки - без авторизации
router.post('/calculate', calculateOrderCost);

// Детали заявки - требует авторизации
router.get('/:id', authenticateToken, getOrderById);

// История статусов заявки - требует авторизации
router.get('/:id/status-history', authenticateToken, getOrderStatusHistory);

// Обновление статуса (для админов) - требует авторизации и валидации
router.put('/:id/status', authenticateToken, validateUpdateOrderStatus, updateOrderStatus);

// Назначение менеджера (для админов) - требует авторизации
router.put('/:id/assign', authenticateToken, assignOrder);

export default router;
