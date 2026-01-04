import { Router } from 'express';
import {
  createApplication,
  getApplicationById,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  assignApplication,
} from '../controllers/application.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Создание заявки доступно без авторизации
router.post('/', createApplication);

// Получение всех заявок (для админов) - требует авторизации
router.get('/', authenticateToken, getAllApplications);

// Мои заявки (требует авторизации)
router.get('/my', authenticateToken, getMyApplications);

// Детали заявки - без авторизации (можно добавить проверку прав)
router.get('/:id', getApplicationById);

// Обновление статуса (для админов) - требует авторизации
router.put('/:id/status', authenticateToken, updateApplicationStatus);

// Назначение менеджера (для админов) - требует авторизации
router.put('/:id/assign', authenticateToken, assignApplication);

export default router;

