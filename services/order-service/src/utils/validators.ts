// @ts-ignore - joi types are included
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

/**
 * Схема валидации для создания заказа
 */
export const createOrderSchema = Joi.object({
  userId: Joi.number().integer().positive().allow(null).optional(),
  tariffId: Joi.number().integer().positive().required(),
  providerId: Joi.number().integer().positive().required(),
  fullName: Joi.string().min(2).max(200).required(),
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).min(10).required(),
  email: Joi.string().email().allow(null, '').optional(),
  firstName: Joi.string().max(100).allow(null, '').optional(),
  lastName: Joi.string().max(100).allow(null, '').optional(),
  dateOfBirth: Joi.date().allow(null).optional(),
  citizenship: Joi.string().max(100).allow(null, '').optional(),
  regionId: Joi.number().integer().positive().allow(null).optional(),
  cityId: Joi.number().integer().positive().allow(null).optional(),
  streetId: Joi.number().integer().positive().allow(null).optional(),
  buildingId: Joi.number().integer().positive().allow(null).optional(),
  apartmentId: Joi.number().integer().positive().allow(null).optional(),
  addressString: Joi.string().max(500).allow(null, '').optional(),
  entrance: Joi.string().max(50).allow(null, '').optional(),
  floor: Joi.string().max(50).allow(null, '').optional(),
  intercom: Joi.string().max(50).allow(null, '').optional(),
  preferredDate: Joi.date().allow(null).optional(),
  preferredTimeFrom: Joi.string().max(10).allow(null, '').optional(),
  preferredTimeTo: Joi.string().max(10).allow(null, '').optional(),
  comment: Joi.string().max(1000).allow(null, '').optional(),
  source: Joi.string().max(100).allow(null, '').optional(),
  utmSource: Joi.string().max(100).allow(null, '').optional(),
  utmMedium: Joi.string().max(100).allow(null, '').optional(),
  utmCampaign: Joi.string().max(100).allow(null, '').optional(),
  utmContent: Joi.string().max(100).allow(null, '').optional(),
  utmTerm: Joi.string().max(100).allow(null, '').optional(),
  routerOption: Joi.string().valid('none', 'purchase', 'rent').allow(null, '').optional(),
  tvSettopOption: Joi.string().valid('none', 'purchase', 'rent').allow(null, '').optional(),
  simCardOption: Joi.string().valid('none', 'purchase', 'rent').allow(null, '').optional(),
});

/**
 * Middleware для валидации создания заказа
 */
export const validateCreateOrder = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error, value } = createOrderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
    const appError = new Error(errorMessage) as AppError;
    appError.statusCode = 400;
    return next(appError);
  }

  // Заменяем body на валидированные данные
  req.body = value;
  next();
};

/**
 * Схема валидации для обновления статуса заказа
 */
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'processing', 'contacted', 'scheduled', 'connected', 'cancelled', 'rejected')
    .required(),
  comment: Joi.string().max(500).allow(null, '').optional(),
});

/**
 * Middleware для валидации обновления статуса заказа
 */
export const validateUpdateOrderStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error, value } = updateOrderStatusSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
    const appError = new Error(errorMessage) as AppError;
    appError.statusCode = 400;
    return next(appError);
  }

  req.body = value;
  next();
};
