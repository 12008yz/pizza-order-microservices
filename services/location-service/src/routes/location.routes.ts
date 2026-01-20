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
  createCity,
  createStreet,
  createBuilding,
  createApartment,
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

// Создание адресов
router.post('/cities', createCity);
router.post('/streets', createStreet);
router.post('/buildings', createBuilding);
router.post('/apartments', createApartment);

export default router;
