import { Coverage, Provider } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { normalizeCity, normalizeStreet, normalizeDistrict } from '../utils/addressNormalizer';

export class CoverageService {
  /**
   * Проверяет покрытие для адреса
   * Использует нормализацию для корректного поиска независимо от формата ввода
   */
  async checkAddress(city: string, street?: string, house?: number) {
    // Нормализуем входящие данные
    const normalizedCity = normalizeCity(city);
    const normalizedStreet = street ? normalizeStreet(street) : null;

    // Ищем по нормализованным значениям
    // Используем LIKE для частичного совпадения (на случай небольших различий)
    const where: any = {
      [Op.or]: [
        { city: normalizedCity },
        { city: { [Op.like]: `%${normalizedCity}%` } }, // частичное совпадение
      ],
    };

    if (normalizedStreet) {
      if (!where[Op.and]) {
        where[Op.and] = [];
      }
      where[Op.and].push({
        [Op.or]: [
          { street: normalizedStreet },
          { street: { [Op.like]: `%${normalizedStreet}%` } },
          { street: null }, // если улица не указана в coverage, значит покрывается весь город
        ],
      });
    }

    if (house !== undefined) {
      if (!where[Op.and]) {
        where[Op.and] = [];
      }
      where[Op.and].push(
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
        }
      );
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
    const normalizedCity = normalizeCity(city);

    const streets = await Coverage.findAll({
      where: {
        [Op.or]: [
          { city: normalizedCity },
          { city: { [Op.like]: `%${normalizedCity}%` } },
        ],
      },
      attributes: ['street'],
      group: ['street'],
      raw: true,
    });

    return streets
      .map(s => s.street)
      .filter(s => s !== null);
  }

  /**
   * Автодополнение адресов из базы покрытия
   * Возвращает подсказки адресов на основе запроса
   */
  async autocompleteAddress(query: string, limit: number = 10): Promise<Array<{
    text: string;
    formatted: string;
    city: string;
    street?: string;
    district?: string;
  }>> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const normalizedQuery = normalizeCity(query);

    // Поиск по городам
    const cityRecords = await Coverage.findAll({
      where: {
        [Op.or]: [
          { city: { [Op.iLike]: searchTerm } },
          { city: normalizedQuery },
        ],
      },
      attributes: ['city', 'district'],
      limit: 50, // Получаем больше записей для фильтрации уникальных
      raw: true,
    }) as Array<{ city: string; district: string | null }>;

    // Поиск по улицам
    const streetRecords = await Coverage.findAll({
      where: {
        [Op.or]: [
          { street: { [Op.iLike]: searchTerm } },
          { street: normalizeStreet(query) },
        ],
        street: { [Op.ne]: null },
      },
      attributes: ['city', 'street', 'district'],
      limit: 50, // Получаем больше записей для фильтрации уникальных
      raw: true,
    }) as Array<{ city: string; street: string; district: string | null }>;

    const suggestions: Array<{
      text: string;
      formatted: string;
      city: string;
      street?: string;
      district?: string;
    }> = [];

    // Добавляем уникальные города
    const uniqueCities = new Map<string, { city: string; district?: string }>();
    for (const record of cityRecords) {
      const cityKey = record.city;
      if (cityKey && !uniqueCities.has(cityKey)) {
        uniqueCities.set(cityKey, {
          city: cityKey,
          district: record.district || undefined,
        });
      }
    }

    // Добавляем города в suggestions
    for (const cityData of uniqueCities.values()) {
      suggestions.push({
        text: cityData.city,
        formatted: cityData.city,
        city: cityData.city,
        district: cityData.district,
      });
    }

    // Добавляем уникальные улицы
    const uniqueStreets = new Map<string, { city: string; street: string; district?: string }>();
    for (const record of streetRecords) {
      const streetName = record.street || '';
      const cityName = record.city || '';
      if (streetName && cityName) {
        const key = `${cityName}|${streetName}`;
        if (!uniqueStreets.has(key)) {
          uniqueStreets.set(key, {
            city: cityName,
            street: streetName,
            district: record.district || undefined,
          });
        }
      }
    }

    // Добавляем улицы в suggestions
    for (const streetData of uniqueStreets.values()) {
      const formatted = `${streetData.city}, ${streetData.street}`;
      suggestions.push({
        text: formatted,
        formatted,
        city: streetData.city,
        street: streetData.street,
        district: streetData.district,
      });
    }

    return suggestions.slice(0, limit);
  }

  /**
   * Создает запись о покрытии
   * Автоматически нормализует адресные данные перед сохранением
   */
  async createCoverage(data: {
    providerId: number;
    city: string;
    district?: string;
    street?: string;
    houseFrom?: number;
    houseTo?: number;
  }) {
    // Нормализуем данные перед сохранением
    const normalizedData = {
      ...data,
      city: normalizeCity(data.city),
      district: normalizeDistrict(data.district),
      street: normalizeStreet(data.street),
    };

    return await Coverage.create(normalizedData);
  }

  /**
   * Обновляет запись о покрытии
   * Нормализует адресные данные при обновлении
   */
  async updateCoverage(id: number, data: Partial<Coverage>) {
    const coverage = await Coverage.findByPk(id);
    if (!coverage) {
      const error = new Error('Coverage not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Нормализуем данные перед обновлением
    const normalizedData: any = { ...data };
    if (data.city) normalizedData.city = normalizeCity(data.city);
    if (data.district !== undefined) normalizedData.district = normalizeDistrict(data.district);
    if (data.street !== undefined) normalizedData.street = normalizeStreet(data.street);

    await coverage.update(normalizedData);
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

