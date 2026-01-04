import { Router } from 'express';
import {
  getAllTariffs,
  getTariffById,
  getTariffsByAddress,
  createTariff,
  updateTariff,
  deleteTariff,
} from '../controllers/tariff.controller';

const router = Router();

router.get('/', getAllTariffs);
router.get('/by-address', getTariffsByAddress);
router.get('/:id', getTariffById);
router.post('/', createTariff);
router.put('/:id', updateTariff);
router.delete('/:id', deleteTariff);

export default router;

