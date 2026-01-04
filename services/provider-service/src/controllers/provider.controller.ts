import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../services/provider.service';
import { TariffService } from '../services/tariff.service';
import { CoverageService } from '../services/coverage.service';

const providerService = new ProviderService();
const tariffService = new TariffService();
const coverageService = new CoverageService();

export const getAllProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { active } = req.query;
    const activeOnly = active !== 'false';
    const providers = await providerService.getAllProviders(activeOnly);
    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const provider = await providerService.getProviderById(parseInt(id));
    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderTariffs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tariffs = await tariffService.getAllTariffs({
      providerId: parseInt(id),
    });
    res.status(200).json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderCoverage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const coverage = await coverageService.getProvidersByAddress('Москва'); // TODO: передавать адрес
    res.status(200).json({
      success: true,
      data: coverage,
    });
  } catch (error) {
    next(error);
  }
};

export const createProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const provider = await providerService.createProvider(req.body);
    res.status(201).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const provider = await providerService.updateProvider(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

