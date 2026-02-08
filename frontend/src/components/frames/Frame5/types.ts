// Состояние формы персональных данных
export interface PersonalData {
  firstName: string;
  lastName: string;
  birthDate: string; // формат ДД.ММ.ГГГГ
  phone: string; // формат +7 XXX XXX XX XX
}

// Состояние формы адреса
export interface AddressData {
  city: string;
  street: string;
  building: string;
  apartment: string | null;
  floor: number | null;
}

// Полное состояние заявки
export interface OrderFormState {
  personalData: PersonalData;
  addressData: AddressData;
  isSubmitting: boolean;
  orderNumber: string | null;
}

// Шаги формы
export type FormStep =
  | 'personal_data'
  | 'address'
  | 'confirmation'
  | 'success';

// Ошибки валидации
export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phone?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
}

// Опции для выбора квартиры
export interface ApartmentOption {
  id: string;
  number: string;
  floor?: number;
}
