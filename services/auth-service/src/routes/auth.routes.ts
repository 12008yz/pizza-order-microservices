import { Router } from 'express';
import { register, login, refreshToken, logout, verifyToken } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/verify', verifyToken);

export default router;
