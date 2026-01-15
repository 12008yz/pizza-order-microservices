import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все endpoints требуют авторизации (только для операторов/админов)
// User Service используется только для управления профилями операторов
router.get('/profile', authenticateToken, getProfile); // Получить свой профиль оператора

export default router;




