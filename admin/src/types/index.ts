export type OrderStatus =
  | "new"
  | "processing"
  | "contacted"
  | "scheduled"
  | "connected"
  | "cancelled"
  | "rejected";

export interface Order {
  id: number;
  userId: number | null;
  tariffId: number;
  providerId: number;
  status: OrderStatus;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  citizenship: string | null;
  regionId: number | null;
  cityId: number | null;
  streetId: number | null;
  buildingId: number | null;
  apartmentId: number | null;
  addressString: string | null;
  entrance: string | null;
  floor: string | null;
  intercom: string | null;
  preferredDate: string | null;
  preferredTimeFrom: string | null;
  preferredTimeTo: string | null;
  routerOption: string | null;
  /** Количество WI-оборудования, напр. "1 шт." */
  routerQuantity?: string | null;
  routerNeed: string | null;
  routerPurchase: string | null;
  routerOperator: string | null;
  routerConfig: string | null;
  routerPrice: number | null;
  tvSettopOption: string | null;
  tvSettopPrice: number | null;
  simCardOption: string | null;
  simCardPrice: number | null;
  totalMonthlyPrice: number | null;
  totalConnectionPrice: number | null;
  totalEquipmentPrice: number | null;
  assignedTo: string | null;
  internalComment: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  /** Режим подключения: apartment | private | office */
  connectionType?: string | null;
  // Joined from other services
  tariff?: Tariff;
  provider?: Provider;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "operator";
  department: string | null;
  isActive: boolean;
}

export interface Provider {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
}

export interface Tariff {
  id: number;
  name: string;
  description: string;
  providerId: number;
  speed: number;
  price: number;
  connectionPrice: number;
  technology: string;
  hasTV: boolean;
  tvChannels: number | null;
  hasMobile: boolean;
  mobileMinutes: number | null;
  mobileGB: number | null;
  mobileSMS: number | null;
  promoPrice: number | null;
  promoMonths: number | null;
  promoText: string | null;
  isActive: boolean;
  provider?: Provider;
}

export interface Building {
  id: number;
  streetId: number;
  number: string;
  type: string | null;
  entrances: number | null;
  floors: number | null;
  apartments: number | null;
  street?: { name: string; city?: { name: string; region?: { name: string } } };
}

export interface PaginatedResponse<T> {
  orders?: T[];
  data?: T[];
  items?: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}
