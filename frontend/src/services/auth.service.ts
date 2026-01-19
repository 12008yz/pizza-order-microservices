import { apiClient } from './api/client';
import type { ApiResponse } from './api/types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
    phone?: string;
  };
}

class AuthService {
  /**
   * Вход в систему
   */
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Регистрация
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    // Очищаем токен на клиенте
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Проверить токен
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: any }>> {
    return apiClient.get<{ valid: boolean; user?: any }>('/api/auth/verify');
  }

  /**
   * Обновить токен
   */
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
    
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }
}

export const authService = new AuthService();
