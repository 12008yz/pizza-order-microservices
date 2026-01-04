import { Provider } from '../models/Provider';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class ProviderService {
  async getAllProviders(activeOnly: boolean = true) {
    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    return await Provider.findAll({
      where,
      order: [['rating', 'DESC']],
    });
  }

  async getProviderById(id: number) {
    const provider = await Provider.findByPk(id);
    if (!provider) {
      const error = new Error('Provider not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return provider;
  }

  async getProviderBySlug(slug: string) {
    const provider = await Provider.findOne({
      where: { slug },
    });
    if (!provider) {
      const error = new Error('Provider not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return provider;
  }

  async createProvider(data: {
    name: string;
    slug: string;
    logo: string;
    description: string;
    website: string;
    phone: string;
    foundedYear?: number;
  }) {
    return await Provider.create(data);
  }

  async updateProvider(id: number, data: Partial<Provider>) {
    const provider = await this.getProviderById(id);
    await provider.update(data);
    return provider;
  }

  async deleteProvider(id: number) {
    const provider = await this.getProviderById(id);
    await provider.destroy();
    return { message: 'Provider deleted successfully' };
  }
}

