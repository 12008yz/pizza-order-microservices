import axios from 'axios';
import crypto from 'crypto';
import { AvailabilityCache, TechnicalAccess } from '../models';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
const LOCATION_SERVICE_URL = process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';
const CACHE_TTL_HOURS = 24; // Время жизни кеша в часах

export interface AddressCheckRequest {
  city: string;
  street?: string;
  house?: number;
  buildingId?: number;
  apartmentId?: number;
}

export interface ProviderAvailability {
  providerId: number;
  providerName: string;
  isAvailable: boolean;
  connectionType?: string;
}

export class AvailabilityService {
  /**
   * Генерирует хеш адреса для кеширования
   */
  private generateAddressHash(address: AddressCheckRequest): string {
    const addressString = `${address.city}|${address.street || ''}|${address.house || ''}|${address.buildingId || ''}|${address.apartmentId || ''}`;
    return crypto.createHash('md5').update(addressString).digest('hex');
  }

  /**
   * Проверяет доступность провайдеров по адресу
   * Приоритет: поиск по ID (быстро) → кеш → Provider Service (Coverage)
   */
  async checkAvailability(address: AddressCheckRequest): Promise<ProviderAvailability[]> {
    try {
      // ПРИОРИТЕТ 1: Если есть buildingId или apartmentId - используем быстрый поиск по ID
      if (address.buildingId || address.apartmentId) {
        const providers = await this.getProvidersByAddressId(
          address.buildingId,
          address.apartmentId
        );
        
        if (providers.length > 0) {
          logger.info('Availability found by ID (fast path)', {
            buildingId: address.buildingId,
            apartmentId: address.apartmentId,
          });
          return providers;
        }
        // Если не нашли по ID, продолжаем поиск через Coverage
      }

      // ПРИОРИТЕТ 2: Проверяем кеш по текстовому адресу
      const addressHash = this.generateAddressHash(address);
      const cached = await this.getCachedAvailability(addressHash);
      if (cached && cached.length > 0) {
        logger.info('Availability found in cache', { addressHash });
        
        // Сохраняем в TechnicalAccess для быстрого доступа в будущем (если есть ID)
        if (address.buildingId || address.apartmentId) {
          await this.saveTechnicalAccess(address.buildingId, address.apartmentId, cached);
        }
        
        return cached;
      }

      // ПРИОРИТЕТ 3: Запрашиваем через Provider Service (Coverage) - медленнее
      const providers = await this.checkCoverage(address);

      // Сохраняем в кеш
      await this.saveToCache(addressHash, providers);

      // Сохраняем в TechnicalAccess для быстрого доступа в будущем (если есть ID)
      if ((address.buildingId || address.apartmentId) && providers.length > 0) {
        await this.saveTechnicalAccess(address.buildingId, address.apartmentId, providers);
      }

      return providers;
    } catch (error: any) {
      logger.error('Error checking availability:', {
        error: error.message,
        address,
      });
      throw error;
    }
  }

  /**
   * Проверяет покрытие через Provider Service
   */
  private async checkCoverage(address: AddressCheckRequest): Promise<ProviderAvailability[]> {
    try {
      // Запрос к Provider Service для проверки покрытия
      const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/coverage/check`, {
        params: {
          city: address.city,
          street: address.street,
          house: address.house,
        },
        timeout: 5000,
      });

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        logger.warn('Invalid response from coverage service', {
          response: response.data,
        });
        return [];
      }

      // Преобразуем ответ в формат ProviderAvailability
      const providers: ProviderAvailability[] = response.data.data.map((provider: any) => ({
        providerId: provider.id,
        providerName: provider.name || 'Unknown',
        isAvailable: true, // Если провайдер есть в Coverage, значит доступен
        connectionType: 'fiber', // По умолчанию, можно расширить
      }));

      return providers;
    } catch (error: any) {
      logger.error('Error checking coverage:', {
        error: error.message,
        address,
        status: error.response?.status,
      });

      // Если сервис недоступен, возвращаем пустой массив
      // В продакшене можно добавить fallback логику
      return [];
    }
  }

  /**
   * Получает доступность из кеша
   */
  private async getCachedAvailability(addressHash: string): Promise<ProviderAvailability[] | null> {
    try {
      const cache = await AvailabilityCache.findOne({
        where: {
          addressHash,
          expiresAt: {
            [Op.gt]: new Date(), // Кеш еще не истек
          },
        },
      });

      if (!cache) {
        return null;
      }

      // Парсим JSON строку
      const providerIds = JSON.parse(cache.availableProviders);
      
      // Получаем информацию о провайдерах
      const providers = await this.getProvidersInfo(providerIds);
      
      return providers;
    } catch (error: any) {
      logger.error('Error getting cached availability:', {
        error: error.message,
        addressHash,
      });
      return null;
    }
  }

  /**
   * Сохраняет результат в кеш
   */
  private async saveToCache(
    addressHash: string,
    providers: ProviderAvailability[]
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

      const providerIds = providers.map(p => p.providerId);

      await AvailabilityCache.upsert({
        addressHash,
        availableProviders: JSON.stringify(providerIds),
        expiresAt,
      });

      logger.info('Availability cached', { addressHash, providerCount: providers.length });
    } catch (error: any) {
      logger.error('Error saving to cache:', {
        error: error.message,
        addressHash,
      });
      // Не бросаем ошибку, кеширование не критично
    }
  }

  /**
   * Получает информацию о провайдерах по их ID
   */
  private async getProvidersInfo(providerIds: number[]): Promise<ProviderAvailability[]> {
    if (providerIds.length === 0) {
      return [];
    }

    try {
      // Запрашиваем информацию о провайдерах из Provider Service
      // Используем batch запрос, если возможно, или последовательные запросы
      const providers: ProviderAvailability[] = [];
      
      // Запрашиваем всех провайдеров сразу через список
      try {
        const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/providers`, {
          params: {
            active: true,
          },
          timeout: 5000,
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          // Фильтруем только нужных провайдеров
          const allProviders = response.data.data;
          for (const providerId of providerIds) {
            const provider = allProviders.find((p: any) => p.id === providerId);
            if (provider) {
              providers.push({
                providerId: provider.id,
                providerName: provider.name || 'Unknown',
                isAvailable: true,
                connectionType: 'fiber',
              });
            }
          }
        }
      } catch (error: any) {
        logger.warn('Error fetching providers list:', {
          error: error.message,
        });
        
        // Fallback: запрашиваем по одному
        for (const providerId of providerIds) {
          try {
            const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/providers/${providerId}`, {
              timeout: 3000,
            });

            if (response.data?.success && response.data.data) {
              providers.push({
                providerId: response.data.data.id,
                providerName: response.data.data.name || 'Unknown',
                isAvailable: true,
                connectionType: 'fiber',
              });
            }
          } catch (err: any) {
            logger.warn('Error fetching provider info:', {
              providerId,
              error: err.message,
            });
            // Продолжаем с другими провайдерами
          }
        }
      }

      return providers;
    } catch (error: any) {
      logger.error('Error getting providers info:', {
        error: error.message,
        providerIds,
      });
      return [];
    }
  }

  /**
   * Получает доступные провайдеры по ID адреса (buildingId или apartmentId)
   * БЫСТРЫЙ ПУТЬ: прямой поиск по индексу в TechnicalAccess
   */
  async getProvidersByAddressId(buildingId?: number, apartmentId?: number): Promise<ProviderAvailability[]> {
    try {
      if (!buildingId && !apartmentId) {
        return [];
      }

      // Строим условие поиска
      const where: any = {
        isAvailable: true,
      };

      if (apartmentId) {
        // Если есть apartmentId - ищем по нему (более точный поиск)
        where.apartmentId = apartmentId;
      } else if (buildingId) {
        // Если только buildingId - ищем по дому
        where.buildingId = buildingId;
        where.apartmentId = null; // Только записи для всего дома, не для конкретной квартиры
      }

      // Ищем в TechnicalAccess - БЫСТРЫЙ поиск по индексу
      const technicalAccess = await TechnicalAccess.findAll({
        where,
      });

      if (technicalAccess.length === 0) {
        return [];
      }

      const providerIds = [...new Set(technicalAccess.map(ta => ta.providerId))];
      return await this.getProvidersInfo(providerIds);
    } catch (error: any) {
      logger.error('Error getting providers by address ID:', {
        error: error.message,
        buildingId,
        apartmentId,
      });
      throw error;
    }
  }

  /**
   * Сохраняет информацию о доступности в TechnicalAccess для быстрого доступа
   */
  private async saveTechnicalAccess(
    buildingId: number | undefined,
    apartmentId: number | undefined,
    providers: ProviderAvailability[]
  ): Promise<void> {
    if ((!buildingId && !apartmentId) || providers.length === 0) {
      return;
    }

    try {
      // Сохраняем каждого провайдера
      for (const provider of providers) {
        if (!provider.isAvailable) {
          continue;
        }

        await TechnicalAccess.upsert({
          buildingId: buildingId || null,
          apartmentId: apartmentId || null,
          providerId: provider.providerId,
          connectionType: provider.connectionType || 'fiber',
          isAvailable: true,
        }, {
          // Обновляем, если запись уже существует
          conflictFields: buildingId && apartmentId 
            ? ['buildingId', 'apartmentId', 'providerId']
            : buildingId
            ? ['buildingId', 'providerId']
            : ['apartmentId', 'providerId'],
        });
      }

      logger.info('Technical access saved for fast lookup', {
        buildingId,
        apartmentId,
        providerCount: providers.length,
      });
    } catch (error: any) {
      logger.error('Error saving technical access:', {
        error: error.message,
        buildingId,
        apartmentId,
      });
      // Не бросаем ошибку, это не критично
    }
  }

  /**
   * Очищает истекшие записи из кеша
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const deleted = await AvailabilityCache.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });

      logger.info('Expired cache cleaned', { deletedCount: deleted });
      return deleted;
    } catch (error: any) {
      logger.error('Error cleaning expired cache:', {
        error: error.message,
      });
      return 0;
    }
  }
}
