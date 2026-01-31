import { apiClient } from './client';
import type { AvailabilityCheck, ApiResponse } from '@tariff/shared-types';

export interface CheckAvailabilityParams {
  city: string;
  street?: string;
  house?: number;
  buildingId?: number;
  apartmentId?: number;
  apartmentNumber?: string;
}

class AvailabilityService {
  async checkAvailability(params: CheckAvailabilityParams): Promise<ApiResponse<unknown[]>> {
    return apiClient.post<unknown[]>(`/api/availability/check`, params);
  }

  async getAvailabilityByAddress(addressId: number): Promise<ApiResponse<AvailabilityCheck[]>> {
    return apiClient.get<AvailabilityCheck[]>(`/api/availability/${addressId}`);
  }

  async getProvidersByAddress(addressId: number): Promise<ApiResponse<unknown[]>> {
    return apiClient.get<unknown[]>(`/api/availability/providers/${addressId}`);
  }
}

export const availabilityService = new AvailabilityService();
