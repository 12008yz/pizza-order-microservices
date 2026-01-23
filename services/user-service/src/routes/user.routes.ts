import { Router } from 'express';
import {
   getProfile,
   createOrUpdateProfile,
   getProfileByPhone,
   updateProfileByPhone
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Публичные эндпоинты для регистрации пользователей по телефону
router.post('/profile', createOrUpdateProfile); // Создать/обновить профиль по телефону
router.get('/profile/by-phone/:phone', getProfileByPhone); // Получить профиль по телефону
router.put('/profile/by-phone/:phone', updateProfileByPhone); // Обновить профиль по телефону

// Защищённые эндпоинты (требуют авторизации - только для операторов/админов)
router.get('/profile', authenticateToken, getProfile); // Получить свой профиль оператора

export default router;
