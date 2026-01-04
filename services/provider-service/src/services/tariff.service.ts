import { Tariff } from '../models/Tariff';
import { Provider } from '../models/Provider';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class TariffService {
  async getAllTariffs(filters: {
    providerId?: number;
    speed?: number;
    minPrice?: number;
    maxPrice?: number;
    technology?: string;
    hasTV?: boolean;
    city?: string;
    street?: string;
    house?: number;
  } = {}) {
    const where: any = {
      isActive: true,
    };

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.speed) {
      where.speed = { [Op.gte]: filters.speed };
    }

    if (filters.minPrice !== undefined) {
      where.price = { ...where.price, [Op.gte]: filters.minPrice };
    }

    if (filters.maxPrice !== undefined) {
      where.price = { ...where.price, [Op.lte]: filters.maxPrice };
    }

    if (filters.technology) {
      where.technology = filters.technology;
    }

    if (filters.hasTV !== undefined) {
      where.hasTV = filters.hasTV;
    }

    return await Tariff.findAll({
      where,
      include: [
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name', 'slug', 'logo', 'rating', 'reviewsCount'],
        },
      ],
      order: [['price', 'ASC']],
    });
  }

  async getTariffById(id: number) {
    const tariff = await Tariff.findByPk(id, {
      include: [
        {
          model: Provider,
          as: 'provider',
        },
      ],
    });
    if (!tariff) {
      const error = new Error('Tariff not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return tariff;
  }

  async getTariffsByAddress(city: string, street?: string, house?: number) {
    // Здесь должна быть логика проверки покрытия через Coverage
    // Пока возвращаем все активные тарифы
    return await this.getAllTariffs({ city, street, house });
  }

  async createTariff(data: {
    name: string;
    description: string;
    providerId: number;
    speed: number;
    price: number;
    connectionPrice?: number;
    technology: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'mobile';
    hasTV?: boolean;
    tvChannels?: number;
    hasMobile?: boolean;
    mobileMinutes?: number;
    mobileGB?: number;
    mobileSMS?: number;
    promoPrice?: number;
    promoMonths?: number;
  }) {
    return await Tariff.create(data);
  }

  async updateTariff(id: number, data: Partial<Tariff>) {
    const tariff = await this.getTariffById(id);
    await tariff.update(data);
    return tariff;
  }

  async deleteTariff(id: number) {
    const tariff = await this.getTariffById(id);
    await tariff.destroy();
    return { message: 'Tariff deleted successfully' };
  }
}

