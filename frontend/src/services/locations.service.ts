import { apiClient } from './api/client';
import type { AddressSuggestion, ApiResponse } from './api/types';

export interface AutocompleteParams {
  q: string;
  limit?: number;
  regionId?: number;
  cityId?: number;
}

export interface GetRegionsParams {
  limit?: number;
  offset?: number;
}

export interface GetCitiesParams {
  regionId?: number;
  limit?: number;
  offset?: number;
}

export interface GetStreetsParams {
  cityId?: number;
  limit?: number;
  offset?: number;
}

class LocationsService {
  /**
   * Автодополнение адреса
   */
  async autocomplete(params: AutocompleteParams): Promise<ApiResponse<AddressSuggestion[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.regionId) {
      queryParams.append('regionId', params.regionId.toString());
    }
    if (params.cityId) {
      queryParams.append('cityId', params.cityId.toString());
    }

    return apiClient.get<AddressSuggestion[]>(
      `/api/locations?endpoint=autocomplete&${queryParams.toString()}`
    );
  }

  /**
   * Получить список регионов
   */
  async getRegions(params?: GetRegionsParams): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/locations?endpoint=regions${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<any[]>(url);
  }

  /**
   * Получить список городов
   */
  async getCities(params?: GetCitiesParams): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.regionId) {
      queryParams.append('regionId', params.regionId.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/locations?endpoint=cities${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<any[]>(url);
  }

  /**
   * Получить список улиц
   */
  async getStreets(params?: GetStreetsParams): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.cityId) {
      queryParams.append('cityId', params.cityId.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/locations?endpoint=streets${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<any[]>(url);
  }
}

export const locationsService = new LocationsService();
