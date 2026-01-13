import { Router } from 'express';
import {
  getProfile,
  getProfileByPhone,
  getOrCreateProfileByPhone,
  updateProfileByPhone,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Публичные endpoints (работают без авторизации, идентификация по телефону)
router.post('/profile', getOrCreateProfileByPhone); // Создать или получить профиль по телефону
router.get('/profile', getProfileByPhone); // Получить профиль по телефону (query: ?phone=...)
router.put('/profile', updateProfileByPhone); // Обновить профиль по телефону

// Для админов/менеджеров (требуют авторизации)
router.get('/admin/profile', authenticateToken, getProfile); // Получить профиль по userId (для админов)

export default router;




