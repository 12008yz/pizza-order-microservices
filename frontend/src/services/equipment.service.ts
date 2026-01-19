import { apiClient } from './api/client';
import type { Equipment, ApiResponse } from './api/types';

export interface GetEquipmentParams {
  providerId?: number;
  type?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
}

class EquipmentService {
  /**
   * Получить список оборудования
   */
  async getEquipment(params?: GetEquipmentParams): Promise<ApiResponse<Equipment[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.providerId) {
      queryParams.append('providerId', params.providerId.toString());
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.available !== undefined) {
      queryParams.append('available', params.available.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/equipment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Equipment[]>(url);
  }

  /**
   * Получить оборудование по ID
   */
  async getEquipmentById(id: number): Promise<ApiResponse<Equipment>> {
    return apiClient.get<Equipment>(`/api/equipment/${id}`);
  }
}

export const equipmentService = new EquipmentService();
