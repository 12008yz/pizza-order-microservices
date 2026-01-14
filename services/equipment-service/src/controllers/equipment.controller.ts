import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from '../services/equipment.service';

const equipmentService = new EquipmentService();

/**
 * GET /api/equipment/types
 * Получить все типы оборудования
 */
export const getAllEquipmentTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const types = await equipmentService.getAllEquipmentTypes();
    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/equipment/types/:id
 * Получить тип оборудования по ID
 */
export const getEquipmentTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const type = await equipmentService.getEquipmentTypeById(parseInt(id));
    res.status(200).json({
      success: true,
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/equipment
 * Получить все оборудование с фильтрами
 */
export const getAllEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { providerId, equipmentTypeId, isActive } = req.query;

    const filters: any = {};
    if (providerId) filters.providerId = parseInt(providerId as string);
    if (equipmentTypeId) filters.equipmentTypeId = parseInt(equipmentTypeId as string);
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const equipment = await equipmentService.getAllEquipment(filters);
    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/equipment/:id
 * Получить оборудование по ID
 */
export const getEquipmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const equipment = await equipmentService.getEquipmentById(parseInt(id));
    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/equipment/by-provider/:provider_id
 * Получить оборудование по провайдеру
 */
export const getEquipmentByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { provider_id } = req.params;
    const equipment = await equipmentService.getEquipmentByProvider(parseInt(provider_id));
    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/equipment
 * Создать новое оборудование
 */
export const createEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);
    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/equipment/:id
 * Обновить оборудование
 */
export const updateEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const equipment = await equipmentService.updateEquipment(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/equipment/:id
 * Удалить оборудование
 */
export const deleteEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await equipmentService.deleteEquipment(parseInt(id));
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
