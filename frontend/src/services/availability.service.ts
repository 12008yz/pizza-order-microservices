import { apiClient } from './api/client';
import type { AvailabilityCheck, ApiResponse } from './api/types';

export interface CheckAvailabilityParams {
  city: string;
  street?: string;
  house?: number;
  buildingId?: number;
  apartmentId?: number;
  apartmentNumber?: string;
}

export interface GetProvidersByAddressParams {
  addressId: number;
}

class AvailabilityService {
  /**
   * Проверить доступность провайдеров по адресу
   * POST /api/availability/check
   */
  async checkAvailability(
    params: CheckAvailabilityParams
  ): Promise<ApiResponse<any[]>> {
    return apiClient.post<any[]>(`/api/availability/check`, params);
  }

  /**
   * Получить доступность по адресу
   */
  async getAvailabilityByAddress(
    addressId: number
  ): Promise<ApiResponse<AvailabilityCheck[]>> {
    return apiClient.get<AvailabilityCheck[]>(`/api/availability/${addressId}`);
  }

  /**
   * Получить провайдеров доступных по адресу
   */
  async getProvidersByAddress(
    addressId: number
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/api/availability/providers/${addressId}`);
  }
}

export const availabilityService = new AvailabilityService();
