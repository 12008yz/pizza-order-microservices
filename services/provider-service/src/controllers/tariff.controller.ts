import { Request, Response, NextFunction } from 'express';
import { TariffService } from '../services/tariff.service';

const tariffService = new TariffService();

export const getAllTariffs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      providerId,
      speed,
      minPrice,
      maxPrice,
      technology,
      hasTV,
      hasMobile,
      serviceType, // 'internet' | 'tv' | 'mobile' | 'all'
      city,
      street,
      house,
      sortBy, // 'price' | 'speed' | 'popularity'
      sortOrder, // 'asc' | 'desc'
    } = req.query;

    const filters: any = {};
    if (providerId) filters.providerId = parseInt(providerId as string);
    if (speed) filters.speed = parseInt(speed as string);
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (technology) filters.technology = technology as string;
    if (hasTV !== undefined) filters.hasTV = hasTV === 'true';
    if (hasMobile !== undefined) filters.hasMobile = hasMobile === 'true';
    if (serviceType) filters.serviceType = serviceType as 'internet' | 'tv' | 'mobile' | 'all';
    if (city) filters.city = city as string;
    if (street) filters.street = street as string;
    if (house) filters.house = parseInt(house as string);
    if (sortBy) filters.sortBy = sortBy as 'price' | 'speed' | 'popularity';
    if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

    const tariffs = await tariffService.getAllTariffs(filters);
    res.status(200).json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    next(error);
  }
};

export const getTariffById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tariff = await tariffService.getTariffById(parseInt(id));
    res.status(200).json({
      success: true,
      data: tariff,
    });
  } catch (error) {
    next(error);
  }
};

export const getTariffsByAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, street, house } = req.query;
    const tariffs = await tariffService.getTariffsByAddress(
      city as string,
      street as string | undefined,
      house ? parseInt(house as string) : undefined
    );
    res.status(200).json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    next(error);
  }
};

export const createTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tariff = await tariffService.createTariff(req.body);
    res.status(201).json({
      success: true,
      data: tariff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tariff = await tariffService.updateTariff(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      data: tariff,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await tariffService.deleteTariff(parseInt(id));
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


