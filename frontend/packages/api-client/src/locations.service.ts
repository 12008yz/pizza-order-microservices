import { apiClient } from './client';
import type { AddressSuggestion, ApiResponse } from '@tariff/shared-types';

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
  async autocomplete(params: AutocompleteParams): Promise<ApiResponse<AddressSuggestion[]>> {
    const trimmedQ = params.q?.trim();
    if (!trimmedQ || trimmedQ.length < 2) return { success: true, data: [] };
    const queryParams = new URLSearchParams();
    queryParams.append('q', trimmedQ);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.regionId) queryParams.append('regionId', params.regionId.toString());
    if (params.cityId) queryParams.append('cityId', params.cityId.toString());
    return apiClient.get<AddressSuggestion[]>(`/api/locations?endpoint=autocomplete&${queryParams.toString()}`);
  }

  async searchAddress(params: SearchAddressParams): Promise<ApiResponse<unknown>> {
    const trimmedQ = params.q?.trim();
    if (!trimmedQ || trimmedQ.length < 2) return { success: true, data: { local: [], coverage: [] } };
    const queryParams = new URLSearchParams();
    queryParams.append('q', trimmedQ);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    return apiClient.get<unknown>(`/api/locations?endpoint=search&${queryParams.toString()}`);
  }

  async getRegions(params?: GetRegionsParams): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const url = `/api/locations?endpoint=regions${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<unknown[]>(url);
  }

  async getCities(params?: GetCitiesParams): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params?.regionId) queryParams.append('regionId', params.regionId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const url = `/api/locations?endpoint=cities${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<unknown[]>(url);
  }

  async getStreets(params?: GetStreetsParams): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params?.cityId) queryParams.append('cityId', params.cityId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.streetTypeId) queryParams.append('streetTypeId', params.streetTypeId.toString());
    const url = `/api/locations?endpoint=streets${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
    return apiClient.get<unknown[]>(url);
  }

  async getBuildings(params: GetBuildingsParams): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('street_id', params.streetId.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    return apiClient.get<unknown[]>(`/api/locations?endpoint=buildings&${queryParams.toString()}`);
  }

  async getApartments(params: GetApartmentsParams & { entrance?: number; floor?: number }): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('building_id', params.buildingId.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.entrance !== undefined) queryParams.append('entrance', params.entrance.toString());
    if (params.floor !== undefined) queryParams.append('floor', params.floor.toString());
    return apiClient.get<unknown[]>(`/api/locations?endpoint=apartments&${queryParams.toString()}`);
  }

  async createCity(params: { name: string; regionId?: number; latitude?: number; longitude?: number }): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`/api/locations?endpoint=cities`, params);
  }

  async createStreet(params: { name: string; cityId: number; streetTypeId?: number; latitude?: number; longitude?: number }): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`/api/locations?endpoint=streets`, params);
  }

  async createBuilding(params: { number: string; streetId: number; building?: string; latitude?: number; longitude?: number; postalCode?: string }): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`/api/locations?endpoint=buildings`, params);
  }

  async createApartment(params: { number: string; buildingId: number }): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`/api/locations?endpoint=apartments`, params);
  }
}

export const locationsService = new LocationsService();
