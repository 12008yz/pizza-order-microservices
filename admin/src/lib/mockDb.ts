import type { AdminUser, Building, LoginResponse, Order, Provider, Tariff } from "@/types";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import { MOCK_TARIFFS as SEED_TARIFFS } from "@/lib/mockTariffs";

type ApiEnvelope<T> = { success: true; data: T };

export type Region = { id: number; name: string };
export type City = { id: number; regionId: number; name: string };
export type Street = { id: number; cityId: number; name: string };

const SEED_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: "Ростелеком",
    slug: "rostelecom",
    logo: "",
    description: "",
    website: "",
    phone: "",
    rating: 0,
    reviewsCount: 0,
    isActive: true,
  },
  {
    id: 2,
    name: "МТС",
    slug: "mtc",
    logo: "",
    description: "",
    website: "",
    phone: "",
    rating: 0,
    reviewsCount: 0,
    isActive: true,
  },
  {
    id: 3,
    name: "Дом.ru",
    slug: "domru",
    logo: "",
    description: "",
    website: "",
    phone: "",
    rating: 0,
    reviewsCount: 0,
    isActive: true,
  },
];

const SEED_REGIONS: Region[] = [
  { id: 1, name: "Москва" },
  { id: 2, name: "Московская обл." },
  { id: 3, name: "Санкт-Петербург" },
  { id: 4, name: "Ленинградская обл." },
];

const SEED_CITIES: City[] = [
  { id: 11, regionId: 1, name: "гор. Москва, Московская обл." },
  { id: 12, regionId: 2, name: "Химки" },
  { id: 13, regionId: 2, name: "Подольск" },
  { id: 14, regionId: 2, name: "Балашиха" },
  { id: 15, regionId: 3, name: "Санкт-Петербург" },
];

const SEED_STREETS: Street[] = [
  { id: 101, cityId: 11, name: "наб. Кремлевская" },
  { id: 102, cityId: 11, name: "ул. Тверская" },
  { id: 103, cityId: 11, name: "ул. Арбат" },
  { id: 104, cityId: 11, name: "пр. Мира" },
  { id: 201, cityId: 15, name: "Невский проспект" },
];

let providers: Provider[] = [...SEED_PROVIDERS];
let tariffs: Tariff[] = SEED_TARIFFS.map((t) => ({
  ...t,
  provider: providers.find((p) => p.id === t.providerId),
}));
let orders: Order[] = MOCK_ORDERS.map((o) => ({
  ...o,
  provider: providers.find((p) => p.id === o.providerId),
  tariff: tariffs.find((t) => t.id === o.tariffId) ?? o.tariff,
}));

const regions: Region[] = [...SEED_REGIONS];
const cities: City[] = [...SEED_CITIES];
const streets: Street[] = [...SEED_STREETS];
let buildings: Building[] = [
  { id: 1, streetId: 101, number: "9 к 6", type: null, entrances: 6, floors: 9, apartments: 200 },
  { id: 2, streetId: 102, number: "12", type: null, entrances: 4, floors: 12, apartments: 240 },
];

function envelope<T>(data: T): ApiEnvelope<T> {
  return { success: true, data };
}

function nextId(list: { id: number }[]): number {
  return list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}

export const mockDb = {
  login(email: string): LoginResponse {
    const user: AdminUser = {
      id: 1,
      email,
      name: "Mock Admin",
      role: "admin",
      department: null,
      isActive: true,
    };
    return {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      user,
    };
  },

  verifyToken(): ApiEnvelope<{ success?: boolean }> {
    return envelope({ success: true });
  },

  fetchOrders(params?: { status?: string }): ApiEnvelope<Order[]> {
    const status = params?.status?.trim();
    const list = status ? orders.filter((o) => o.status === status) : orders;
    return envelope(list);
  },

  fetchOrder(id: string | number): Order | null {
    const n = typeof id === "string" ? Number(id) : id;
    if (!Number.isFinite(n)) return null;
    return orders.find((o) => o.id === n) ?? null;
  },

  updateOrder(id: number, payload: Record<string, unknown>): Order | null {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    const prev = orders[idx];
    const next = {
      ...prev,
      ...(payload as Partial<Order>),
      updatedAt: new Date().toISOString(),
    };
    next.provider = providers.find((p) => p.id === next.providerId);
    next.tariff = tariffs.find((t) => t.id === next.tariffId);
    orders[idx] = next;
    return next;
  },

  fetchTariffs(): ApiEnvelope<Tariff[]> {
    return envelope(tariffs.map((t) => ({ ...t, provider: providers.find((p) => p.id === t.providerId) })));
  },

  createTariff(payload: Omit<Tariff, "id">): ApiEnvelope<Tariff> {
    const id = nextId(tariffs);
    const provider = providers.find((p) => p.id === payload.providerId);
    const nextTariff: Tariff = { id, ...payload, provider };
    tariffs = [nextTariff, ...tariffs];
    return envelope(nextTariff);
  },

  fetchProviders(): ApiEnvelope<Provider[]> {
    return envelope(providers);
  },

  createProvider(name: string): ApiEnvelope<Provider> {
    const id = nextId(providers);
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9а-яё-]/gi, "");
    const nextProvider: Provider = {
      id,
      name: name.trim(),
      slug: slug || `provider-${id}`,
      logo: "",
      description: "",
      website: "",
      phone: "",
      rating: 0,
      reviewsCount: 0,
      isActive: true,
    };
    providers = [nextProvider, ...providers];
    // Обновим provider у тарифов/заявок на случай совпадений id
    tariffs = tariffs.map((t) => ({ ...t, provider: providers.find((p) => p.id === t.providerId) }));
    orders = orders.map((o) => ({ ...o, provider: providers.find((p) => p.id === o.providerId) }));
    return envelope(nextProvider);
  },

  fetchRegions(): ApiEnvelope<Region[]> {
    return envelope(regions);
  },

  fetchCities(regionId: number): ApiEnvelope<City[]> {
    return envelope(cities.filter((c) => c.regionId === regionId));
  },

  fetchStreets(cityId: number): ApiEnvelope<Street[]> {
    return envelope(streets.filter((s) => s.cityId === cityId));
  },

  fetchBuildings(streetId: number): ApiEnvelope<Building[]> {
    return envelope(buildings.filter((b) => b.streetId === streetId));
  },

  createBuilding(payload: { streetId: number; number: string }): ApiEnvelope<Building> {
    const id = nextId(buildings);
    const nextBuilding: Building = {
      id,
      streetId: payload.streetId,
      number: payload.number.trim(),
      type: null,
      entrances: null,
      floors: null,
      apartments: null,
    };
    buildings = [nextBuilding, ...buildings];
    return envelope(nextBuilding);
  },
};

