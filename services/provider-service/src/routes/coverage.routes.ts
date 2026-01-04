import { Router } from 'express';
import {
  checkAddress,
  getCities,
  getStreets,
  createCoverage,
} from '../controllers/coverage.controller';

const router = Router();

router.get('/check', checkAddress);
router.get('/cities', getCities);
router.get('/streets', getStreets);
router.post('/', createCoverage);

export default router;

