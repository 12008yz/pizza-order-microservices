// Общие типы для API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddressSuggestion {
  text: string;
  formatted: string;
  regionId?: number;
  cityId?: number;
  streetId?: number;
  buildingId?: number;
  apartmentId?: number;
}

export interface Provider {
  id: number;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  reviewsCount: number;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tariff {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  speed: number;
  price: number;
  currency: string;
  period: string; // 'month', 'year', etc.
  features?: string[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  provider?: Provider;
}

export interface Order {
  id: number;
  providerId: number;
  tariffId: number;
  userId?: number;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  status: string;
  totalPrice?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  provider?: Provider;
  tariff?: Tariff;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: number;
  providerId: number;
  name: string;
  type: string;
  price: number;
  currency: string;
  description?: string;
  available?: boolean;
}

export interface AvailabilityCheck {
  addressId: number;
  providerId: number;
  available: boolean;
  connectionType?: string;
  estimatedInstallationTime?: string;
}
