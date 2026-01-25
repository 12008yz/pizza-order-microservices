import { Router } from 'express';
import {
  register,
  registerAdmin,
  login,
  loginAdmin,
  refreshToken,
  logout,
  verifyToken,
  createOrUpdateUserByPhone,
} from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validation';
import { requireInternalApiKey } from '../middleware/internalApiAuth';
import { registrationLimiter, loginLimiter } from '../middleware/rateLimiter';

const router = Router();

// Публичные роуты (для обратной совместимости)
router.post('/register', registrationLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);

// Роуты для админов/операторов (CRM панель)
router.post('/admin/register', registrationLimiter, validateRegister, registerAdmin);
router.post('/admin/login', loginLimiter, validateLogin, loginAdmin);

// Общие роуты
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/verify', verifyToken);

// Внутренний API для создания пользователя по телефону (для использования другими сервисами)
// Защищён проверкой API ключа через заголовок X-Internal-Api-Key
router.post('/internal/user-by-phone', requireInternalApiKey, createOrUpdateUserByPhone);

export default router;
