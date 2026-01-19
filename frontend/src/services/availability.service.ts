import { apiClient } from './api/client';
import type { AvailabilityCheck, ApiResponse } from './api/types';

export interface CheckAvailabilityParams {
  addressId: number;
  providerId?: number;
}

export interface GetProvidersByAddressParams {
  addressId: number;
}

class AvailabilityService {
  /**
   * Проверить доступность провайдера по адресу
   */
  async checkAvailability(
    params: CheckAvailabilityParams
  ): Promise<ApiResponse<AvailabilityCheck>> {
    const queryParams = new URLSearchParams();
    queryParams.append('addressId', params.addressId.toString());
    if (params.providerId) {
      queryParams.append('providerId', params.providerId.toString());
    }

    return apiClient.get<AvailabilityCheck>(
      `/api/availability/check?${queryParams.toString()}`
    );
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
