import { Request, Response, NextFunction } from 'express';
import { CoverageService } from '../services/coverage.service';

const coverageService = new CoverageService();

export const checkAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, street, house } = req.query;
    const providerIds = await coverageService.checkAddress(
      city as string,
      street as string | undefined,
      house ? parseInt(house as string) : undefined
    );
    const providers = await coverageService.getProvidersByAddress(
      city as string,
      street as string | undefined,
      house ? parseInt(house as string) : undefined
    );
    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cities = await coverageService.getCities();
    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
};

export const getStreets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City parameter is required',
      });
    }
    const streets = await coverageService.getStreets(city as string);
    res.status(200).json({
      success: true,
      data: streets,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoverage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coverage = await coverageService.createCoverage(req.body);
    res.status(201).json({
      success: true,
      data: coverage,
    });
  } catch (error) {
    next(error);
  }
};

export const autocompleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, limit } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 10;
    const suggestions = await coverageService.autocompleteAddress(q, limitNum);
    
    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};


