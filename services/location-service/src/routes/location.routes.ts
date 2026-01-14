import { Router } from 'express';
import {
  getRegions,
  getCities,
  getStreetTypes,
  getStreets,
  getBuildings,
  getApartments,
  searchAddress,
  autocompleteAddress,
} from '../controllers/location.controller';

const router = Router();

// Регионы
router.get('/regions', getRegions);

// Города
router.get('/cities', getCities);

// Типы улиц
router.get('/street-types', getStreetTypes);

// Улицы
router.get('/streets', getStreets);

// Дома
router.get('/buildings', getBuildings);

// Квартиры
router.get('/apartments', getApartments);

// Поиск адреса
router.get('/search', searchAddress);

// Автодополнение адреса
router.get('/autocomplete', autocompleteAddress);

export default router;
