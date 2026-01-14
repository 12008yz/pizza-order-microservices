import axios from 'axios';
import { logger } from '../utils/logger';

export interface GeocoderResponse {
  response: {
    GeoObjectCollection: {
      featureMember: Array<{
        GeoObject: {
          metaDataProperty: {
            GeocoderMetaData: {
              precision: string;
              text: string;
              kind: string;
              Address: {
                country_code: string;
                formatted: string;
                Components: Array<{
                  kind: string;
                  name: string;
                }>;
              };
            };
          };
          name: string;
          description: string;
          Point: {
            pos: string; // "37.617635 55.755814" (долгота широта)
          };
        };
      }>;
    };
  };
}

export interface AddressSuggestion {
  text: string;
  formatted: string;
  kind: string;
  precision: string;
  latitude?: number;
  longitude?: number;
  components: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    house?: string;
  };
}

export class GeocoderService {
  private apiKey: string;
  private baseUrl = 'https://geocode-maps.yandex.ru/1.x';

  constructor() {
    this.apiKey = process.env.YANDEX_GEOCODER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('YANDEX_GEOCODER_API_KEY not set in environment variables');
    }
  }

  /**
   * Автодополнение адреса через Яндекс Геокодер
   */
  async autocomplete(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    if (!this.apiKey) {
      throw new Error('Yandex Geocoder API key is not configured');
    }

    try {
      const params: any = {
        apikey: this.apiKey,
        geocode: query,
        format: 'json',
        results: limit,
        // kind: 'house', // Убираем для более широкого поиска при автодополнении
      };

      logger.info('Yandex Geocoder request:', {
        url: this.baseUrl,
        params: { ...params, apikey: '***' }, // Не логируем полный ключ
      });

      const response = await axios.get<GeocoderResponse>(this.baseUrl, {
        params,
        headers: {
          'User-Agent': 'Gigapoisk-Location-Service/1.0',
          'Referer': process.env.ALLOWED_REFERER || 'http://localhost:3005',
        },
      });

      logger.info('Yandex Geocoder response:', {
        status: response.status,
        hasData: !!response.data,
        hasResponse: !!response.data?.response,
        hasCollection: !!response.data?.response?.GeoObjectCollection,
        memberCount: response.data?.response?.GeoObjectCollection?.featureMember?.length || 0,
        responseData: JSON.stringify(response.data).substring(0, 1000), // Первые 1000 символов ответа
      });

      const suggestions: AddressSuggestion[] = [];

      if (response.data?.response?.GeoObjectCollection?.featureMember) {
        for (const member of response.data.response.GeoObjectCollection.featureMember) {
          const geoObject = member.GeoObject;
          const metaData = geoObject.metaDataProperty?.GeocoderMetaData;
          const address = metaData?.Address;

          if (!metaData || !address) continue;

          // Парсим координаты
          const [longitude, latitude] = geoObject.Point?.pos
            ?.split(' ')
            .map(Number) || [null, null];

          // Парсим компоненты адреса
          const components: AddressSuggestion['components'] = {};
          if (address.Components) {
            for (const component of address.Components) {
              switch (component.kind) {
                case 'country':
                  components.country = component.name;
                  break;
                case 'province':
                case 'area':
                  components.region = component.name;
                  break;
                case 'locality':
                case 'district':
                  components.city = component.name;
                  break;
                case 'street':
                  components.street = component.name;
                  break;
                case 'house':
                  components.house = component.name;
                  break;
              }
            }
          }

          suggestions.push({
            text: metaData.text || geoObject.name,
            formatted: address.formatted || geoObject.description || geoObject.name,
            kind: metaData.kind || 'house',
            precision: metaData.precision || 'other',
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            components,
          });
        }
      }

      return suggestions;
    } catch (error: any) {
      logger.error('Yandex Geocoder API error:', {
        message: error.message,
        query,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.response?.headers,
      });
      throw new Error(`Geocoder service error: ${error.message}`);
    }
  }

  /**
   * Поиск адреса (более точный поиск)
   */
  async search(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    return this.autocomplete(query, limit);
  }

  /**
   * Обратный геокодинг (по координатам)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<AddressSuggestion | null> {
    if (!this.apiKey) {
      throw new Error('Yandex Geocoder API key is not configured');
    }

    try {
      const response = await axios.get<GeocoderResponse>(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          geocode: `${longitude},${latitude}`, // Яндекс использует формат долгота,широта
          format: 'json',
          results: 1,
          kind: 'house',
        },
      });

      if (
        response.data?.response?.GeoObjectCollection?.featureMember &&
        response.data.response.GeoObjectCollection.featureMember.length > 0
      ) {
        const geoObject = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const metaData = geoObject.metaDataProperty?.GeocoderMetaData;
        const address = metaData?.Address;

        if (!metaData || !address) return null;

        const components: AddressSuggestion['components'] = {};
        if (address.Components) {
          for (const component of address.Components) {
            switch (component.kind) {
              case 'country':
                components.country = component.name;
                break;
              case 'province':
              case 'area':
                components.region = component.name;
                break;
              case 'locality':
              case 'district':
                components.city = component.name;
                break;
              case 'street':
                components.street = component.name;
                break;
              case 'house':
                components.house = component.name;
                break;
            }
          }
        }

        return {
          text: metaData.text || geoObject.name,
          formatted: address.formatted || geoObject.description || geoObject.name,
          kind: metaData.kind || 'house',
          precision: metaData.precision || 'other',
          latitude,
          longitude,
          components,
        };
      }

      return null;
    } catch (error: any) {
      logger.error('Yandex Geocoder reverse geocode error:', {
        message: error.message,
        latitude,
        longitude,
        status: error.response?.status,
      });
      throw new Error(`Reverse geocode error: ${error.message}`);
    }
  }
}
