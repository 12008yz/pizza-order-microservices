import { Router } from 'express';
import {
  getAllProviders,
  getProviderById,
  getProviderTariffs,
  getProviderCoverage,
  createProvider,
  updateProvider,
} from '../controllers/provider.controller';

const router = Router();

router.get('/', getAllProviders);
router.get('/:id', getProviderById);
router.get('/:id/tariffs', getProviderTariffs);
router.get('/:id/coverage', getProviderCoverage);
router.post('/', createProvider);
router.put('/:id', updateProvider);

export default router;


