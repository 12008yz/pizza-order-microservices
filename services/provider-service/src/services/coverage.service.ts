import { Coverage } from '../models/Coverage';
import { Provider } from '../models/Provider';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class CoverageService {
  async checkAddress(city: string, street?: string, house?: number) {
    const where: any = {
      city,
    };

    if (street) {
      where.street = street;
    }

    if (house !== undefined) {
      where[Op.and] = [
        {
          [Op.or]: [
            { houseFrom: null },
            { houseFrom: { [Op.lte]: house } },
          ],
        },
        {
          [Op.or]: [
            { houseTo: null },
            { houseTo: { [Op.gte]: house } },
          ],
        },
      ];
    }

    const coverage = await Coverage.findAll({
      where,
      include: [
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name', 'slug', 'logo'],
        },
      ],
    });

    // Получаем уникальных провайдеров
    const providerIds = [...new Set(coverage.map(c => c.providerId))];
    return providerIds;
  }

  async getProvidersByAddress(city: string, street?: string, house?: number) {
    const providerIds = await this.checkAddress(city, street, house);
    
    if (providerIds.length === 0) {
      return [];
    }

    return await Provider.findAll({
      where: {
        id: {
          [Op.in]: providerIds,
        },
        isActive: true,
      },
    });
  }

  async getCities() {
    const cities = await Coverage.findAll({
      attributes: ['city'],
      group: ['city'],
      raw: true,
    });

    return cities.map(c => c.city);
  }

  async getStreets(city: string) {
    const streets = await Coverage.findAll({
      where: { city },
      attributes: ['street'],
      group: ['street'],
      raw: true,
    });

    return streets
      .map(s => s.street)
      .filter(s => s !== null);
  }

  async createCoverage(data: {
    providerId: number;
    city: string;
    district?: string;
    street?: string;
    houseFrom?: number;
    houseTo?: number;
  }) {
    return await Coverage.create(data);
  }

  async updateCoverage(id: number, data: Partial<Coverage>) {
    const coverage = await Coverage.findByPk(id);
    if (!coverage) {
      const error = new Error('Coverage not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    await coverage.update(data);
    return coverage;
  }

  async deleteCoverage(id: number) {
    const coverage = await Coverage.findByPk(id);
    if (!coverage) {
      const error = new Error('Coverage not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    await coverage.destroy();
    return { message: 'Coverage deleted successfully' };
  }
}

