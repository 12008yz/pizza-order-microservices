import { Router } from 'express';
import {
  checkAvailability,
  getAvailabilityByAddressId,
  getProvidersByAddressId,
} from '../controllers/availability.controller';

const router = Router();

router.post('/check', checkAvailability);
router.get('/:address_id', getAvailabilityByAddressId);
router.get('/providers/:address_id', getProvidersByAddressId);

export default router;
