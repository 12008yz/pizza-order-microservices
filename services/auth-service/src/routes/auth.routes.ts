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

const router = Router();

// Публичные роуты (для обратной совместимости)
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Роуты для админов/операторов (CRM панель)
router.post('/admin/register', validateRegister, registerAdmin);
router.post('/admin/login', validateLogin, loginAdmin);

// Общие роуты
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/verify', verifyToken);

// Внутренний API для создания пользователя по телефону (для использования другими сервисами)
router.post('/internal/user-by-phone', createOrUpdateUserByPhone);

export default router;
