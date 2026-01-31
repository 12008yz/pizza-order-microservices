import { apiClient } from './client';
import type { ApiResponse } from '@tariff/shared-types';

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
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: unknown }>> {
    return apiClient.get<{ valid: boolean; user?: unknown }>('/api/auth/verify');
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response;
  }
}

export const authService = new AuthService();
