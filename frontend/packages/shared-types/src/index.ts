// API types
export interface ApiResponse<T = unknown> {
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
  id?: number | string;
  text: string;
  formatted?: string;
  regionId?: number;
  region?: string;
  cityId?: number;
  streetId?: number;
  buildingId?: number;
  apartmentId?: number;
  apartmentNumber?: string;
  entrance?: number;
  floor?: number;
  entrances?: number;
  floors?: number;
  apartmentsPerFloor?: number;
  isManual?: boolean;
  isApartmentSuggestion?: boolean;
  isNotInList?: boolean;
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
  price: number | string;
  connectionPrice: number | string;
  technology: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'mobile';
  hasTV: boolean;
  tvChannels?: number | null;
  hasMobile: boolean;
  mobileMinutes?: number | null;
  mobileGB?: number | null;
  mobileSMS?: number | null;
  promoPrice?: number | null;
  promoMonths?: number | null;
  promoText?: string | null;
  favoriteLabel?: string | null;
  favoriteDesc?: string | null;
  popularity?: number;
  isActive?: boolean;
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
  routerOption?: string | null;
  routerNeed?: string | null;
  routerPurchase?: string | null;
  routerOperator?: string | null;
  routerConfig?: string | null;
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

// Address context
export type ConnectionType = 'apartment' | 'private' | 'office' | '';

export interface AddressData {
  connectionType: ConnectionType;
  regionId?: number;
  cityId?: number;
  city?: string;
  streetId?: number;
  street?: string;
  buildingId?: number;
  houseNumber?: string;
  entrance?: number;
  floor?: number;
  apartmentId?: number;
  apartmentNumber?: string;
  privacyConsent: boolean;
  errors: {
    connectionType?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    apartmentNumber?: string;
    privacyConsent?: string;
  };
}

// Frame4 / Equipment types (for EquipmentContext)
export type RouterNeedOption = 'need' | 'from_operator' | 'own' | 'no_thanks';
export type RouterPurchaseOption = 'buy' | 'installment' | 'rent';
export type RouterConfigOption = 'no_config' | 'with_config';
export type RouterOperatorOption = 'beeline' | 'domru' | 'megafon' | 'mts' | 'rostelecom';

export interface RouterSelection {
  need: RouterNeedOption | null;
  purchase?: RouterPurchaseOption | null;
  operator?: RouterOperatorOption | null;
  config?: RouterConfigOption | null;
}

export type TvBoxNeedOption = 'need' | 'have_from_operator' | 'have_own' | 'smart_tv';
export type TvBoxPurchaseOption = 'buy' | 'installment' | 'rent';
export type TvCountOption = 1 | 2 | 3 | 4;
export type TvBoxOperatorOption = 'beeline' | 'domru' | 'megafon' | 'mts' | 'rostelecom';

export interface TvBoxWizardState {
  need: TvBoxNeedOption | null;
  tvCount: TvCountOption | null;
  purchaseOption: TvBoxPurchaseOption | null;
  operatorId: TvBoxOperatorOption | null;
}

export interface EquipmentState {
  router: RouterSelection;
  tvBox?: TvBoxWizardState;
}
