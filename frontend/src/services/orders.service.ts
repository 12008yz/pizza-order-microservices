import { apiClient } from './api/client';
import type { Order, ApiResponse } from './api/types';

/** Детальные поля выбора роутера (Frame4) */
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
  /** Адрес (для API передаётся как addressString) */
  address?: string;
  addressString?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  notes?: string;
  /** Вариант роутера для расчёта цены: none | purchase | rent (можно не указывать, если заданы routerNeed/routerPurchase) */
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
  /**
   * Создать заказ
   */
  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    const body = {
      ...data,
      addressString: data.addressString ?? data.address ?? '',
    };
    return apiClient.post<Order>('/api/orders', body);
  }

  /**
   * Получить список заказов
   */
  async getOrders(params?: GetOrdersParams): Promise<ApiResponse<Order[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.userId) {
      queryParams.append('userId', params.userId.toString());
    }
    if (params?.providerId) {
      queryParams.append('providerId', params.providerId.toString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.phone) {
      queryParams.append('phone', params.phone);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Order[]>(url);
  }

  /**
   * Получить заказ по ID
   */
  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/api/orders/${id}`);
  }

  /**
   * Получить заказы по телефону
   */
  async getOrdersByPhone(phone: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/api/orders/by-phone?phone=${encodeURIComponent(phone)}`);
  }

  /**
   * Получить мои заказы (требует авторизации)
   */
  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/api/orders/my');
  }

  /**
   * Обновить статус заказа
   */
  async updateOrderStatus(
    id: number,
    data: UpdateOrderStatusData
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`/api/orders/${id}/status`, data);
  }

  /**
   * Получить историю статусов заказа
   */
  async getOrderStatusHistory(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/api/orders/${id}/status-history`);
  }

  /**
   * Назначить заказ (для провайдеров)
   */
  async assignOrder(id: number, providerId: number): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/api/orders/${id}/assign`, { providerId });
  }

  /**
   * Рассчитать стоимость заказа
   */
  async calculateOrder(data: CalculateOrderData): Promise<ApiResponse<{ total: number; currency: string }>> {
    return apiClient.post<{ total: number; currency: string }>('/api/orders/calculate', data);
  }
}

export const ordersService = new OrdersService();
