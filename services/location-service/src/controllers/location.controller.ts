import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location.service';
import { AppError } from '../middleware/errorHandler';

const locationService = new LocationService();

/**
 * GET /api/locations/regions
 * Получить список всех регионов
 */
export const getRegions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regions = await locationService.getRegions();
    res.status(200).json({
      success: true,
      data: regions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/cities?region_id={id}
 * Получить города по региону
 */
export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regionId = req.query.region_id as string;

    if (!regionId) {
      throw new AppError('region_id is required', 400);
    }

    const regionIdNum = parseInt(regionId, 10);
    if (isNaN(regionIdNum)) {
      throw new AppError('Invalid region_id', 400);
    }

    const cities = await locationService.getCitiesByRegion(regionIdNum);
    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/street-types
 * Получить типы улиц
 */
export const getStreetTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const streetTypes = await locationService.getStreetTypes();
    res.status(200).json({
      success: true,
      data: streetTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/streets?city_id={id}&street_type_id={id}
 * Получить улицы по городу (с фильтром по типу)
 */
export const getStreets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cityId = req.query.city_id as string;
    const streetTypeId = req.query.street_type_id as string | undefined;

    if (!cityId) {
      throw new AppError('city_id is required', 400);
    }

    const cityIdNum = parseInt(cityId, 10);
    if (isNaN(cityIdNum)) {
      throw new AppError('Invalid city_id', 400);
    }

    const streetTypeIdNum = streetTypeId ? parseInt(streetTypeId, 10) : undefined;
    if (streetTypeId && isNaN(streetTypeIdNum!)) {
      throw new AppError('Invalid street_type_id', 400);
    }

    const streets = await locationService.getStreetsByCity(
      cityIdNum,
      streetTypeIdNum
    );
    res.status(200).json({
      success: true,
      data: streets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/buildings?street_id={id}
 * Получить дома по улице
 */
export const getBuildings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const streetId = req.query.street_id as string;

    if (!streetId) {
      throw new AppError('street_id is required', 400);
    }

    const streetIdNum = parseInt(streetId, 10);
    if (isNaN(streetIdNum)) {
      throw new AppError('Invalid street_id', 400);
    }

    const buildings = await locationService.getBuildingsByStreet(streetIdNum);
    res.status(200).json({
      success: true,
      data: buildings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/apartments?building_id={id}
 * Получить квартиры по дому
 */
export const getApartments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buildingId = req.query.building_id as string;

    if (!buildingId) {
      throw new AppError('building_id is required', 400);
    }

    const buildingIdNum = parseInt(buildingId, 10);
    if (isNaN(buildingIdNum)) {
      throw new AppError('Invalid building_id', 400);
    }

    const apartments = await locationService.getApartmentsByBuilding(buildingIdNum);
    res.status(200).json({
      success: true,
      data: apartments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/search?q={query}
 * Поиск адреса из базы данных покрытия
 */
export const searchAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    if (!query || query.trim().length === 0) {
      throw new AppError('Query parameter "q" is required', 400);
    }

    // Сначала пробуем поиск в локальной БД
    const localResults = await locationService.searchLocal(query.trim());

    // Затем используем базу данных покрытия
    let coverageResults: any[] = [];
    try {
      const results = await locationService.searchAddress(query.trim(), limit);
      coverageResults = results;
    } catch (coverageError: any) {
      // Если сервис покрытия недоступен, используем только локальные результаты
      // Логируем только если это не ожидаемая ошибка (например, сервис недоступен)
      if (coverageError?.statusCode !== 400) {
        // Это не критическая ошибка, просто используем локальные результаты
      }
    }

    res.status(200).json({
      success: true,
      data: {
        local: localResults,
        coverage: coverageResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/autocomplete?q={query}
 * Автодополнение адреса из базы данных покрытия
 */
export const autocompleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    if (!query || query.trim().length === 0) {
      throw new AppError('Query parameter "q" is required', 400);
    }

    if (query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const results = await locationService.autocompleteAddress(query.trim(), limit);
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/locations/cities
 * Создать или найти город
 */
export const createCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, regionId, latitude, longitude } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('City name is required', 400);
    }

    const city = await locationService.createOrFindCity(
      name.trim(),
      regionId ? parseInt(regionId, 10) : undefined,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined
    );

    res.status(200).json({
      success: true,
      data: {
        id: city.id,
        name: city.name,
        regionId: city.regionId,
        latitude: city.latitude,
        longitude: city.longitude,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/locations/streets
 * Создать или найти улицу
 */
export const createStreet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, cityId, streetTypeId, latitude, longitude } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Street name is required', 400);
    }

    if (!cityId) {
      throw new AppError('cityId is required', 400);
    }

    const cityIdNum = parseInt(cityId, 10);
    if (isNaN(cityIdNum)) {
      throw new AppError('Invalid cityId', 400);
    }

    const street = await locationService.createOrFindStreet(
      name.trim(),
      cityIdNum,
      streetTypeId ? parseInt(streetTypeId, 10) : undefined,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined
    );

    res.status(200).json({
      success: true,
      data: street,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/locations/buildings
 * Создать или найти дом
 */
export const createBuilding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { number, streetId, building, latitude, longitude, postalCode } = req.body;

    if (!number || typeof number !== 'string' || number.trim().length === 0) {
      throw new AppError('Building number is required', 400);
    }

    if (!streetId) {
      throw new AppError('streetId is required', 400);
    }

    const streetIdNum = parseInt(streetId, 10);
    if (isNaN(streetIdNum)) {
      throw new AppError('Invalid streetId', 400);
    }

    const buildingRecord = await locationService.createOrFindBuilding(
      number.trim(),
      streetIdNum,
      building?.trim(),
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      postalCode?.trim()
    );

    res.status(200).json({
      success: true,
      data: buildingRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/locations/apartments
 * Создать или найти квартиру
 */
export const createApartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { number, buildingId } = req.body;

    if (!number || typeof number !== 'string' || number.trim().length === 0) {
      throw new AppError('Apartment number is required', 400);
    }

    if (!buildingId) {
      throw new AppError('buildingId is required', 400);
    }

    const buildingIdNum = parseInt(buildingId, 10);
    if (isNaN(buildingIdNum)) {
      throw new AppError('Invalid buildingId', 400);
    }

    const apartment = await locationService.createOrFindApartment(
      number.trim(),
      buildingIdNum
    );

    res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    next(error);
  }
};
