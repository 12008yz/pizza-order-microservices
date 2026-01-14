import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByProvider,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipmentTypes,
  getEquipmentTypeById,
} from '../controllers/equipment.controller';

const router = Router();

// Типы оборудования
router.get('/types', getAllEquipmentTypes);
router.get('/types/:id', getEquipmentTypeById);

// Оборудование
router.get('/', getAllEquipment);
router.get('/by-provider/:provider_id', getEquipmentByProvider);
router.get('/:id', getEquipmentById);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;
