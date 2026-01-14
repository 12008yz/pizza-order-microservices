import { Equipment } from '../models/Equipment';
import { EquipmentType } from '../models/EquipmentType';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://provider-service:3003';

export class EquipmentService {
  /**
   * Получить все типы оборудования
   */
  async getAllEquipmentTypes() {
    return await EquipmentType.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Получить тип оборудования по ID
   */
  async getEquipmentTypeById(id: number) {
    const equipmentType = await EquipmentType.findByPk(id);
    if (!equipmentType) {
      const error = new Error('Equipment type not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return equipmentType;
  }

  /**
   * Получить все оборудование с фильтрами
   */
  async getAllEquipment(filters: {
    providerId?: number;
    equipmentTypeId?: number;
    isActive?: boolean;
  } = {}) {
    const where: any = {};

    if (filters.providerId !== undefined) {
      where.providerId = filters.providerId;
    }

    if (filters.equipmentTypeId !== undefined) {
      where.equipmentTypeId = filters.equipmentTypeId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      // По умолчанию показываем только активное
      where.isActive = true;
    }

    return await Equipment.findAll({
      where,
      include: [
        {
          model: EquipmentType,
          as: 'equipmentType',
          attributes: ['id', 'name', 'slug', 'description'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Получить оборудование по ID
   */
  async getEquipmentById(id: number) {
    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: EquipmentType,
          as: 'equipmentType',
        },
      ],
    });

    if (!equipment) {
      const error = new Error('Equipment not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Получаем информацию о провайдере из Provider Service
    try {
      const providerResponse = await axios.get(
        `${PROVIDER_SERVICE_URL}/api/providers/${equipment.providerId}`
      );
      return {
        ...equipment.toJSON(),
        provider: providerResponse.data.data || providerResponse.data,
      };
    } catch (error) {
      // Если провайдер не найден, возвращаем оборудование без информации о провайдере
      return equipment;
    }
  }

  /**
   * Получить оборудование по провайдеру
   */
  async getEquipmentByProvider(providerId: number) {
    return await this.getAllEquipment({ providerId, isActive: true });
  }

  /**
   * Создать новое оборудование
   */
  async createEquipment(data: {
    name: string;
    description: string;
    providerId: number;
    equipmentTypeId: number;
    purchasePrice?: number | null;
    installmentMonths?: number | null;
    rentalMonthlyPrice?: number | null;
    setupPrice?: number;
    imageUrl?: string | null;
  }) {
    // Проверяем существование типа оборудования
    await this.getEquipmentTypeById(data.equipmentTypeId);

    // Проверяем существование провайдера (опционально, через Provider Service)
    try {
      await axios.get(`${PROVIDER_SERVICE_URL}/api/providers/${data.providerId}`);
    } catch (error) {
      const appError = new Error('Provider not found') as AppError;
      appError.statusCode = 404;
      throw appError;
    }

    return await Equipment.create({
      ...data,
      setupPrice: data.setupPrice || 0,
      isActive: true,
    });
  }

  /**
   * Обновить оборудование
   */
  async updateEquipment(id: number, data: Partial<Equipment>) {
    const equipment = await this.getEquipmentById(id);

    if (data.equipmentTypeId) {
      await this.getEquipmentTypeById(data.equipmentTypeId);
    }

    if (data.providerId) {
      try {
        await axios.get(`${PROVIDER_SERVICE_URL}/api/providers/${data.providerId}`);
      } catch (error) {
        const appError = new Error('Provider not found') as AppError;
        appError.statusCode = 404;
        throw appError;
      }
    }

    await equipment.update(data);
    return equipment;
  }

  /**
   * Удалить оборудование
   */
  async deleteEquipment(id: number) {
    const equipment = await this.getEquipmentById(id);
    await equipment.destroy();
    return { message: 'Equipment deleted successfully' };
  }
}
