import axios, { type AxiosInstance } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearAuth, setUser } from "./auth";
import type { LoginRequest, LoginResponse } from "@/types";

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:3001";
const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? "http://localhost:3004";
const LOCATION_SERVICE_URL = process.env.NEXT_PUBLIC_LOCATION_SERVICE_URL ?? "http://localhost:3005";
const PROVIDER_SERVICE_URL = process.env.NEXT_PUBLIC_PROVIDER_SERVICE_URL ?? "http://localhost:3003";
const EQUIPMENT_SERVICE_URL = process.env.NEXT_PUBLIC_EQUIPMENT_SERVICE_URL ?? "http://localhost:3007";

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (r) => r,
    async (err) => {
      const original = err.config;
      if (err.response?.status === 401 && !original._retry && typeof window !== "undefined") {
        original._retry = true;
        const refresh = getRefreshToken();
        if (refresh) {
          try {
            const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
              `${AUTH_SERVICE_URL}/api/auth/refresh`,
              { refreshToken: refresh }
            );
            setTokens(data.accessToken, data.refreshToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return axios(original);
          } catch {
            clearAuth();
            window.location.href = "/login";
          }
        } else {
          clearAuth();
          window.location.href = "/login";
        }
      }
      return Promise.reject(err);
    }
  );

  return client;
}

export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function loginAdmin(body: LoginRequest): Promise<LoginResponse> {
  const { data: res } = await authApi.post<{ success: boolean; data: LoginResponse }>(
    "/api/auth/admin/login",
    body
  );
  const payload = res.data ?? res;
  if (typeof window !== "undefined") {
    const access = payload.accessToken;
    const refresh = payload.refreshToken;
    if (access && refresh) {
      setTokens(access, refresh);
      setUser(payload.user);
    }
  }
  return payload;
}

export const orderApi = createClient(ORDER_SERVICE_URL);
export const locationApi = createClient(LOCATION_SERVICE_URL);
export const providerApi = createClient(PROVIDER_SERVICE_URL);
export const equipmentApi = createClient(EQUIPMENT_SERVICE_URL);

// Convenience wrappers (order service returns { success, data: Order[] }; no pagination yet)
export async function fetchOrders(params: { status?: string }) {
  const { data } = await orderApi.get<{ success: boolean; data: unknown[] }>("/api/orders", {
    params: params.status ? { status: params.status } : undefined,
  });
  return data;
}

export async function fetchOrder(id: string | number) {
  const { data } = await orderApi.get<{ success: boolean; data: unknown }>(`/api/orders/${id}`);
  return (data as { success?: boolean; data?: unknown }).data;
}

export async function fetchBuildings(streetId: number) {
  const { data } = await locationApi.get<{ success: boolean; data: unknown[] }>(
    "/api/locations/buildings",
    { params: { street_id: streetId } }
  );
  return (data as { data?: unknown[] })?.data ?? [];
}

export async function fetchTariffs(params?: Record<string, string | number>) {
  const { data } = await providerApi.get("/api/tariffs", { params });
  return data;
}

export async function fetchProviders() {
  const { data } = await providerApi.get("/api/providers");
  return data;
}

export async function fetchRegions() {
  const { data } = await locationApi.get("/api/locations/regions");
  return data;
}

export async function fetchCities(regionId: number) {
  const { data } = await locationApi.get("/api/locations/cities", {
    params: { region_id: regionId },
  });
  return data;
}

export async function fetchStreets(cityId: number, streetTypeId?: number) {
  const { data } = await locationApi.get("/api/locations/streets", {
    params: { city_id: cityId, ...(streetTypeId && { street_type_id: streetTypeId }) },
  });
  return data;
}
