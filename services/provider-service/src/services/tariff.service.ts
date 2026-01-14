import { Tariff } from '../models/Tariff';
import { Provider } from '../models/Provider';
import { AppError } from '../middleware/errorHandler';
import { Op, literal } from 'sequelize';

export class TariffService {
  async getAllTariffs(filters: {
    providerId?: number;
    speed?: number;
    minPrice?: number;
    maxPrice?: number;
    technology?: string;
    hasTV?: boolean;
    hasMobile?: boolean;
    serviceType?: 'internet' | 'tv' | 'mobile' | 'all'; // Фильтр по типу услуги
    city?: string;
    street?: string;
    house?: number;
    sortBy?: 'price' | 'speed' | 'popularity'; // Сортировка
    sortOrder?: 'asc' | 'desc'; // Порядок сортировки
  } = {}) {
    const where: any = {
      isActive: true,
    };

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    // Фильтрация по типу услуги (приоритет над отдельными фильтрами)
    if (filters.serviceType && filters.serviceType !== 'all') {
      if (filters.serviceType === 'internet') {
        // Интернет: есть скорость > 0
        where.speed = { [Op.gt]: 0 };
        // Если указана минимальная скорость, применяем её
        if (filters.speed) {
          where.speed = { [Op.gte]: filters.speed };
        }
      } else if (filters.serviceType === 'tv') {
        // ТВ: hasTV = true
        where.hasTV = true;
      } else if (filters.serviceType === 'mobile') {
        // Мобильная связь: hasMobile = true
        where.hasMobile = true;
      }
    } else {
      // Применяем отдельные фильтры только если serviceType не указан или равен 'all'
      if (filters.speed) {
        where.speed = { [Op.gte]: filters.speed };
      }

      if (filters.hasTV !== undefined) {
        where.hasTV = filters.hasTV;
      }

      if (filters.hasMobile !== undefined) {
        where.hasMobile = filters.hasMobile;
      }
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

    // Определение сортировки
    let order: any[] = [];
    const sortBy = filters.sortBy || 'price';
    const sortOrder = filters.sortOrder || 'asc';

    if (sortBy === 'price') {
      order = [['price', sortOrder.toUpperCase()]];
    } else if (sortBy === 'speed') {
      order = [['speed', sortOrder.toUpperCase()]];
    } else if (sortBy === 'popularity') {
      // Сортировка по популярности провайдера (рейтинг * количество отзывов)
      // Используем literal для вычисления популярности
      const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order = [
        [literal('"provider"."rating" * "provider"."reviewsCount"'), direction],
        [{ model: Provider, as: 'provider' }, 'rating', direction],
      ];
    } else {
      order = [['price', 'ASC']];
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
      order,
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


