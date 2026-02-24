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
  dateOfBirth: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // ISO YYYY-MM-DD от фронта
      Joi.allow(null, '')
    )
    .optional(),
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
  routerNeed: Joi.string().valid('need', 'from_operator', 'own', 'no_thanks').allow(null, '').optional(),
  routerPurchase: Joi.string().valid('buy', 'installment', 'rent').allow(null, '').optional(),
  routerOperator: Joi.string().valid('beeline', 'domru', 'megafon', 'mts', 'rostelecom').allow(null, '').optional(),
  routerConfig: Joi.string().valid('no_config', 'with_config').allow(null, '').optional(),
  tvSettopOption: Joi.string().valid('none', 'purchase', 'rent').allow(null, '').optional(),
  simCardOption: Joi.string().valid('none', 'purchase', 'rent').allow(null, '').optional(),
});

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

/**
 * Middleware для валидации создания заказа
 * Приводит providerId и tariffId к числу, если пришли строкой (например из JSON/формы).
 */
export const validateCreateOrder = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = { ...req.body };
  const rawProviderId = body.providerId;
  const rawTariffId = body.tariffId;
  body.providerId = toNumber(body.providerId) ?? body.providerId;
  body.tariffId = toNumber(body.tariffId) ?? body.tariffId;

  if (typeof body.providerId !== "number" && rawProviderId != null) {
    const appError = new Error(
      "providerId должен быть числом. Перезагрузите страницу и выберите тариф заново на странице провайдеров."
    ) as AppError;
    appError.statusCode = 400;
    return next(appError);
  }
  if (typeof body.tariffId !== "number" && rawTariffId != null) {
    const appError = new Error(
      "tariffId должен быть числом. Перезагрузите страницу и выберите тариф заново."
    ) as AppError;
    appError.statusCode = 400;
    return next(appError);
  }

  const { error, value } = createOrderSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
    const appError = new Error(errorMessage) as AppError;
    appError.statusCode = 400;
    return next(appError);
  }

  // Пустую или невалидную строку dateOfBirth приводим к null (в БД не должно попадать "Invalid date")
  if (value.dateOfBirth === '' || (typeof value.dateOfBirth === 'string' && value.dateOfBirth.trim().toLowerCase() === 'invalid date')) {
    value.dateOfBirth = null;
  }

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
