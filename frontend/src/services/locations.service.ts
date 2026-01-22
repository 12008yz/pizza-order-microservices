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
  streetTypeId?: number;
  limit?: number;
  offset?: number;
}

export interface GetBuildingsParams {
  streetId: number;
  limit?: number;
  offset?: number;
}

export interface GetApartmentsParams {
  buildingId: number;
  limit?: number;
  offset?: number;
}

export interface SearchAddressParams {
  q: string;
  limit?: number;
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
   * Поиск адреса
   */
  async searchAddress(params: SearchAddressParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    return apiClient.get<any>(`/api/locations?endpoint=search&${queryParams.toString()}`);
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

    if (params?.streetTypeId) {
      queryParams.append('streetTypeId', params.streetTypeId.toString());
    }

    const url = `/api/locations?endpoint=streets${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<any[]>(url);
  }

  /**
   * Получить список домов по улице
   */
  async getBuildings(params: GetBuildingsParams): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('street_id', params.streetId.toString());
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/locations?endpoint=buildings&${queryParams.toString()}`;
    return apiClient.get<any[]>(url);
  }

  /**
   * Получить список квартир по дому
   */
  async getApartments(params: GetApartmentsParams): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('building_id', params.buildingId.toString());
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/locations?endpoint=apartments&${queryParams.toString()}`;
    return apiClient.get<any[]>(url);
  }

  /**
   * Создать или найти город
   */
  async createCity(params: {
    name: string;
    regionId?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/locations?endpoint=cities`, params);
  }

  /**
   * Создать или найти улицу
   */
  async createStreet(params: {
    name: string;
    cityId: number;
    streetTypeId?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/locations?endpoint=streets`, params);
  }

  /**
   * Создать или найти дом
   */
  async createBuilding(params: {
    number: string;
    streetId: number;
    building?: string;
    latitude?: number;
    longitude?: number;
    postalCode?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/locations?endpoint=buildings`, params);
  }

  /**
   * Создать или найти квартиру
   */
  async createApartment(params: {
    number: string;
    buildingId: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/locations?endpoint=apartments`, params);
  }
}

export const locationsService = new LocationsService();
