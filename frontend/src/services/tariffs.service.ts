import { apiClient } from './api/client';
import type { Tariff, ApiResponse } from './api/types';

export interface GetTariffsParams {
  providerId?: number;
  active?: boolean;
  minSpeed?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

class TariffsService {
  /**
   * Получить список тарифов
   */
  async getTariffs(params?: GetTariffsParams): Promise<ApiResponse<Tariff[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.providerId) {
      queryParams.append('providerId', params.providerId.toString());
    }
    if (params?.active !== undefined) {
      queryParams.append('active', params.active.toString());
    }
    if (params?.minSpeed) {
      queryParams.append('minSpeed', params.minSpeed.toString());
    }
    if (params?.maxPrice) {
      queryParams.append('maxPrice', params.maxPrice.toString());
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

    const url = `/api/tariffs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Tariff[]>(url);
  }

  /**
   * Получить тариф по ID
   */
  async getTariffById(id: number): Promise<ApiResponse<Tariff>> {
    return apiClient.get<Tariff>(`/api/tariffs/${id}`);
  }
}

export const tariffsService = new TariffsService();
