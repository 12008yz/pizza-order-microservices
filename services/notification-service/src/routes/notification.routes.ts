import { Router } from 'express';
import {
  sendNotification,
  getUserNotifications,
  markAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.post('/', sendNotification);
router.get('/user/:user_id', getUserNotifications);
router.put('/:id/read', markAsRead);

export default router;
