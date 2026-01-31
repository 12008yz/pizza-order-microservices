import { apiClient } from './client';
import type { Notification, ApiResponse } from '@tariff/shared-types';

export interface GetNotificationsParams {
  userId?: number;
  read?: boolean;
  limit?: number;
  offset?: number;
}

class NotificationsService {
  async getNotifications(params?: GetNotificationsParams): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const url = `/api/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Notification[]>(url);
  }

  async getUserNotifications(userId: number): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>(`/api/notifications/user/${userId}`);
  }

  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(`/api/notifications/${id}/read`, { read: true });
  }

  async markAllAsRead(userId: number): Promise<ApiResponse<{ count: number }>> {
    return apiClient.patch<{ count: number }>(`/api/notifications/user/${userId}/read-all`, {});
  }
}

export const notificationsService = new NotificationsService();
