import { Request, Response, NextFunction } from 'express';
import { AvailabilityService, AddressCheckRequest } from '../services/availability.service';
import { AppError } from '../middleware/errorHandler';

const availabilityService = new AvailabilityService();

/**
 * POST /api/availability/check
 * Проверка доступности провайдеров по адресу
 */
export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, street, house, buildingId, apartmentId } = req.body;

    if (!city || typeof city !== 'string' || city.trim() === '') {
      const error = new Error('City is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const address: AddressCheckRequest = {
      city: city.trim(),
      street: street?.trim(),
      house: house ? parseInt(house as string, 10) : undefined,
      buildingId: buildingId ? parseInt(buildingId as string, 10) : undefined,
      apartmentId: apartmentId ? parseInt(apartmentId as string, 10) : undefined,
    };

    // Валидация house
    if (address.house !== undefined && isNaN(address.house)) {
      const error = new Error('Invalid house number') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const providers = await availabilityService.checkAvailability(address);

    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/availability/:address_id
 * Получение доступности по ID адреса (buildingId или apartmentId)
 */
export const getAvailabilityByAddressId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { address_id } = req.params;
    const { type } = req.query; // 'building' или 'apartment'

    if (!address_id) {
      const error = new Error('Address ID is required') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const addressId = parseInt(address_id, 10);
    if (isNaN(addressId)) {
      const error = new Error('Invalid address ID') as AppError;
      error.statusCode = 400;
      throw error;
    }

    let providers;
    if (type === 'apartment') {
      providers = await availabilityService.getProvidersByAddressId(
        undefined,
        addressId
      );
    } else {
      // По умолчанию считаем buildingId
      providers = await availabilityService.getProvidersByAddressId(
        addressId,
        undefined
      );
    }

    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/availability/providers/:address_id
 * Получение доступных провайдеров по ID адреса
 * Алиас для getAvailabilityByAddressId
 */
export const getProvidersByAddressId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Используем тот же контроллер
  return getAvailabilityByAddressId(req, res, next);
};
