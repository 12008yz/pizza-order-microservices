/**
 * Типы для Order Service
 */

export interface CreateOrderData {
  userId?: number | null;
  tariffId: number;
  providerId: number;
  fullName: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  citizenship?: string | null;
  regionId?: number | null;
  cityId?: number | null;
  streetId?: number | null;
  buildingId?: number | null;
  apartmentId?: number | null;
  addressString?: string | null;
  entrance?: string | null;
  floor?: string | null;
  intercom?: string | null;
  preferredDate?: Date | null;
  preferredTimeFrom?: string | null;
  preferredTimeTo?: string | null;
  comment?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  routerOption?: string | null;
  routerNeed?: string | null;
  routerPurchase?: string | null;
  routerOperator?: string | null;
  routerConfig?: string | null;
  tvSettopOption?: string | null;
  simCardOption?: string | null;
}

export interface OrderCalculation {
  routerPrice: number | null;
  tvSettopPrice: number | null;
  simCardPrice: number | null;
  totalMonthlyPrice: number | null;
  totalConnectionPrice: number | null;
  totalEquipmentPrice: number | null;
}

export interface CalculateOrderCostData {
  tariffId: number;
  routerOption?: string | null;
  tvSettopOption?: string | null;
  simCardOption?: string | null;
}

export interface OrderFilters {
  status?: string;
  providerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderItemCalculation {
  routerPrice: number | null;
  tvSettopPrice: number | null;
  simCardPrice: number | null;
}
