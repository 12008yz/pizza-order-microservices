import { Router } from 'express';
import {
  checkAddress,
  getCities,
  getStreets,
  createCoverage,
  autocompleteAddress,
} from '../controllers/coverage.controller';

const router = Router();

router.get('/check', checkAddress);
router.get('/cities', getCities);
router.get('/streets', getStreets);
router.get('/autocomplete', autocompleteAddress);
router.post('/', createCoverage);

export default router;


