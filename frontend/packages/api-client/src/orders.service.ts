import { apiClient } from './client';
import type { Order, ApiResponse } from '@tariff/shared-types';

export type RouterNeed = 'need' | 'from_operator' | 'own' | 'no_thanks';
export type RouterPurchase = 'buy' | 'installment' | 'rent';
export type RouterOperator = 'beeline' | 'domru' | 'megafon' | 'mts' | 'rostelecom';
export type RouterConfig = 'no_config' | 'with_config';

export interface CreateOrderData {
  providerId: number;
  tariffId: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  addressString?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  notes?: string;
  routerOption?: 'none' | 'purchase' | 'rent' | null;
  routerNeed?: RouterNeed | null;
  routerPurchase?: RouterPurchase | null;
  routerOperator?: RouterOperator | null;
  routerConfig?: RouterConfig | null;
}

export interface GetOrdersParams {
  userId?: number;
  providerId?: number;
  status?: string;
  phone?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateOrderStatusData {
  status: string;
  notes?: string;
}

export interface CalculateOrderData {
  providerId: number;
  tariffId: number;
  addressId?: number;
  equipmentIds?: number[];
}

class OrdersService {
  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    const body = { ...data, addressString: data.addressString ?? data.address ?? '' };
    return apiClient.post<Order>('/api/orders', body);
  }

  async getOrders(params?: GetOrdersParams): Promise<ApiResponse<Order[]>> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.phone) queryParams.append('phone', params.phone);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Order[]>(url);
  }

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/api/orders/${id}`);
  }

  async getOrdersByPhone(phone: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/api/orders/by-phone?phone=${encodeURIComponent(phone)}`);
  }

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/api/orders/my');
  }

  async updateOrderStatus(id: number, data: UpdateOrderStatusData): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`/api/orders/${id}/status`, data);
  }

  async getOrderStatusHistory(id: number): Promise<ApiResponse<unknown[]>> {
    return apiClient.get<unknown[]>(`/api/orders/${id}/status-history`);
  }

  async assignOrder(id: number, providerId: number): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/api/orders/${id}/assign`, { providerId });
  }

  async calculateOrder(data: CalculateOrderData): Promise<ApiResponse<{ total: number; currency: string }>> {
    return apiClient.post<{ total: number; currency: string }>('/api/orders/calculate', data);
  }
}

export const ordersService = new OrdersService();
