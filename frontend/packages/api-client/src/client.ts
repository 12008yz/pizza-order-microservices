import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse } from '@tariff/shared-types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: typeof window !== 'undefined' ? '' : '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error as { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string });
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error as { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string });
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error as { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string });
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error as { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string });
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error as { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string });
    }
  }

  private handleError(error: { response?: { data?: { error?: string; message?: string }; data?: unknown }; request?: unknown; message?: string }): ApiResponse {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || (error.response.data as { message?: string })?.message || error.message,
        data: error.response.data,
      };
    }
    if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export const apiClient = new ApiClient();
