import { Application } from '../models/Application';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';

export class ApplicationService {
  async createApplication(data: {
    userId?: number | null;
    tariffId: number;
    providerId: number;
    fullName: string;
    phone: string;
    email?: string | null;
    city: string;
    street: string;
    house: string;
    building?: string | null;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    intercom?: string | null;
    preferredDate?: Date | null;
    preferredTimeFrom?: string | null;
    preferredTimeTo?: string | null;
    comment?: string | null;
    source?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
  }) {
    // Проверяем тариф через Provider Service
    try {
      const tariffResponse = await axios.get(
        `${PROVIDER_SERVICE_URL}/api/tariffs/${data.tariffId}`
      );

      if (!tariffResponse.data.success) {
        const error = new Error('Tariff not found') as AppError;
        error.statusCode = 404;
        throw error;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        const appError = new Error('Tariff not found') as AppError;
        appError.statusCode = 404;
        throw appError;
      }
      throw error;
    }

    const application = await Application.create({
      ...data,
      status: 'new',
    });

    logger.info(`Application created: ${application.id} for user ${data.userId || 'anonymous'}`);

    return application;
  }

  async getApplicationById(id: number, userId?: number) {
    const where: any = { id };

    if (userId) {
      where.userId = userId;
    }

    const application = await Application.findOne({ where });

    if (!application) {
      const error = new Error('Application not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  async getUserApplications(userId: number) {
    return await Application.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllApplications(filters: {
    status?: string;
    providerId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt[Op.gte] = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt[Op.lte] = filters.dateTo;
      }
    }

    return await Application.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async updateApplicationStatus(id: number, status: Application['status']) {
    const application = await Application.findByPk(id);
    if (!application) {
      const error = new Error('Application not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await application.update({ status });
    logger.info(`Application ${id} status updated to ${status}`);
    return application;
  }

  async assignApplication(id: number, assignedTo: string) {
    const application = await Application.findByPk(id);
    if (!application) {
      const error = new Error('Application not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await application.update({ assignedTo });
    logger.info(`Application ${id} assigned to ${assignedTo}`);
    return application;
  }
}


