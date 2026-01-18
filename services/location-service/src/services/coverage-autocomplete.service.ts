import axios from 'axios';
import { logger } from '../utils/logger';

export interface AddressSuggestion {
  text: string;
  formatted: string;
  city: string;
  street?: string;
  district?: string;
  kind?: string;
  precision?: string;
  latitude?: number;
  longitude?: number;
  components?: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    house?: string;
  };
}

export class CoverageAutocompleteService {
  private providerServiceUrl: string;

  constructor() {
    this.providerServiceUrl = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3004';
    if (!this.providerServiceUrl) {
      logger.warn('PROVIDER_SERVICE_URL not set in environment variables');
    }
  }

  /**
   * Автодополнение адреса из базы данных покрытия
   */
  async autocomplete(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    try {
      const response = await axios.get(`${this.providerServiceUrl}/api/coverage/autocomplete`, {
        params: {
          q: query,
          limit,
        },
        timeout: 5000,
      });

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        logger.warn('Invalid response from coverage autocomplete service', {
          response: response.data,
        });
        return [];
      }

      // Преобразуем ответ в формат AddressSuggestion
      return response.data.data.map((item: any) => ({
        text: item.text || item.formatted,
        formatted: item.formatted || item.text,
        city: item.city,
        street: item.street,
        district: item.district,
        kind: 'house',
        precision: 'other',
        components: {
          city: item.city,
          street: item.street,
        },
      }));
    } catch (error: any) {
      logger.error('Coverage autocomplete service error:', {
        message: error.message,
        query,
        url: this.providerServiceUrl,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      // Возвращаем пустой массив вместо ошибки, чтобы не ломать работу приложения
      return [];
    }
  }

  /**
   * Поиск адреса (аналогично autocomplete)
   */
  async search(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    return this.autocomplete(query, limit);
  }
}
