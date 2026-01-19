import { apiClient } from './api/client';
import type { Provider, ApiResponse } from './api/types';

export interface GetProvidersParams {
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetProvidersByAddressParams {
  buildingId?: number;
  cityId?: number;
  streetId?: number;
  city?: string;
  street?: string;
  house?: number;
}

class ProvidersService {
  /**
   * Получить список всех провайдеров
   */
  async getProviders(params?: GetProvidersParams): Promise<ApiResponse<Provider[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.active !== undefined) {
      queryParams.append('active', params.active.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/providers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Provider[]>(url);
  }

  /**
   * Получить провайдера по ID
   */
  async getProviderById(id: number): Promise<ApiResponse<Provider>> {
    return apiClient.get<Provider>(`/api/providers/${id}`);
  }

  /**
   * Получить провайдеров по адресу
   */
  async getProvidersByAddress(
    params: GetProvidersByAddressParams
  ): Promise<ApiResponse<Provider[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.buildingId) {
      queryParams.append('buildingId', params.buildingId.toString());
    }
    if (params.cityId) {
      queryParams.append('cityId', params.cityId.toString());
    }
    if (params.streetId) {
      queryParams.append('streetId', params.streetId.toString());
    }
    if (params.city) {
      queryParams.append('city', params.city);
    }
    if (params.street) {
      queryParams.append('street', params.street);
    }
    if (params.house) {
      queryParams.append('house', params.house.toString());
    }

    const url = `/api/providers/by-address?${queryParams.toString()}`;
    return apiClient.get<Provider[]>(url);
  }
}

export const providersService = new ProvidersService();
