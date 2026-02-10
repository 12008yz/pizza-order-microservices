'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type ConnectionType = 'apartment' | 'private' | 'office' | '';

export interface AddressData {
  // Тип подключения
  connectionType: ConnectionType;

  // Адрес (ID из базы данных)
  regionId?: number;
  cityId?: number;
  city?: string;
  streetId?: number;
  street?: string;
  buildingId?: number;
  houseNumber?: string;
  corpusNumber?: string; // Корпус
  entrance?: number; // Номер подъезда
  floor?: number; // Номер этажа
  apartmentId?: number;
  apartmentNumber?: string;

  // Согласие с политикой
  privacyConsent: boolean;

  // Валидация
  errors: {
    connectionType?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    apartmentNumber?: string;
    privacyConsent?: string;
  };
}

interface AddressContextType {
  addressData: AddressData;
  updateConnectionType: (type: ConnectionType) => void;
  updateCity: (cityId?: number, city?: string, regionId?: number) => void;
  updateStreet: (streetId?: number, street?: string) => void;
  updateHouseNumber: (buildingId?: number, houseNumber?: string, apartmentId?: number) => void;
  updateCorpusNumber: (corpusNumber?: string) => void;
  updateEntrance: (entrance?: number) => void;
  updateFloor: (floor?: number) => void;
  updateApartmentNumber: (apartmentId?: number, apartmentNumber?: string) => void;
  updatePrivacyConsent: (consent: boolean) => void;
  clearAddress: () => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  setError: (field: keyof AddressData['errors'], message: string) => void;
}

const defaultAddressData: AddressData = {
  connectionType: '',
  privacyConsent: false,
  errors: {},
};

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Всегда начинаем с дефолтных данных для избежания ошибок гидратации
  const [addressData, setAddressData] = useState<AddressData>(defaultAddressData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Загружаем данные из sessionStorage только на клиенте после монтирования.
  // Сначала addressFormData (черновик из формы), если пусто — берём addressData (итог из Frame1 или перезапись из Frame5).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const formData = sessionStorage.getItem('addressFormData');
      if (formData) {
        const parsed = JSON.parse(formData);
        if (parsed.city || parsed.street || parsed.houseNumber) {
          setAddressData({ ...parsed, errors: {} });
          setIsHydrated(true);
          return;
        }
      }

      const savedAddress = sessionStorage.getItem('addressData');
      if (savedAddress) {
        const parsed = JSON.parse(savedAddress);
        setAddressData({
          ...defaultAddressData,
          city: parsed.city ?? defaultAddressData.city,
          street: parsed.street ?? defaultAddressData.street,
          houseNumber: parsed.houseNumber ?? defaultAddressData.houseNumber,
          corpusNumber: parsed.corpusNumber ?? defaultAddressData.corpusNumber,
          apartmentNumber: parsed.apartmentNumber ?? defaultAddressData.apartmentNumber,
          connectionType: parsed.connectionType ?? defaultAddressData.connectionType,
          privacyConsent: parsed.privacyConsent ?? defaultAddressData.privacyConsent,
          errors: {},
        });
      }
    } catch (error) {
      console.warn('Failed to load address data from sessionStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Сохраняем данные в sessionStorage при каждом изменении (только после гидратации)
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    
    try {
      // Сохраняем только данные, без ошибок валидации
      const dataToSave = {
        ...addressData,
        errors: {},
      };
      sessionStorage.setItem('addressFormData', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save address data to sessionStorage:', error);
    }
  }, [addressData, isHydrated]);

  const updateConnectionType = useCallback((type: ConnectionType) => {
    setAddressData((prev) => ({
      ...prev,
      connectionType: type,
      errors: { ...prev.errors, connectionType: undefined },
    }));
  }, []);

  const updateCity = useCallback((cityId?: number, city?: string, regionId?: number) => {
    setAddressData((prev) => ({
      ...prev,
      cityId,
      city,
      regionId,
      // Очищаем зависимые поля при изменении города
      streetId: undefined,
      street: undefined,
      buildingId: undefined,
      houseNumber: undefined,
      corpusNumber: undefined,
      apartmentId: undefined,
      errors: { ...prev.errors, city: undefined, street: undefined, houseNumber: undefined },
    }));
  }, []);

  const updateStreet = useCallback((streetId?: number, street?: string) => {
    setAddressData((prev) => ({
      ...prev,
      streetId,
      street,
      // Очищаем зависимые поля при изменении улицы
      buildingId: undefined,
      houseNumber: undefined,
      corpusNumber: undefined,
      apartmentId: undefined,
      errors: { ...prev.errors, street: undefined, houseNumber: undefined },
    }));
  }, []);

  const updateHouseNumber = useCallback(
    (buildingId?: number, houseNumber?: string, apartmentId?: number) => {
      setAddressData((prev) => ({
        ...prev,
        buildingId,
        houseNumber,
        // Очищаем подъезд и этаж при изменении дома
        entrance: undefined,
        floor: undefined,
        // Если передан apartmentId, используем его, иначе очищаем
        apartmentId: apartmentId ?? undefined,
        apartmentNumber: apartmentId ? prev.apartmentNumber : undefined,
        errors: { ...prev.errors, houseNumber: undefined, apartmentNumber: undefined },
      }));
    },
    []
  );

  const updateCorpusNumber = useCallback((corpusNumber?: string) => {
    setAddressData((prev) => ({
      ...prev,
      corpusNumber,
      errors: { ...prev.errors },
    }));
  }, []);

  const updateEntrance = useCallback((entrance?: number) => {
    setAddressData((prev) => ({
      ...prev,
      entrance,
      // Очищаем этаж и квартиру при изменении подъезда
      floor: undefined,
      apartmentId: undefined,
      apartmentNumber: undefined,
      errors: { ...prev.errors, apartmentNumber: undefined },
    }));
  }, []);

  const updateFloor = useCallback((floor?: number) => {
    setAddressData((prev) => ({
      ...prev,
      floor,
      // Очищаем квартиру при изменении этажа
      apartmentId: undefined,
      apartmentNumber: undefined,
      errors: { ...prev.errors, apartmentNumber: undefined },
    }));
  }, []);

  const updateApartmentNumber = useCallback(
    (apartmentId?: number, apartmentNumber?: string) => {
      setAddressData((prev) => ({
        ...prev,
        apartmentId,
        apartmentNumber,
        errors: { ...prev.errors, apartmentNumber: undefined },
      }));
    },
    []
  );

  const updatePrivacyConsent = useCallback((consent: boolean) => {
    setAddressData((prev) => ({
      ...prev,
      privacyConsent: consent,
      errors: { ...prev.errors, privacyConsent: undefined },
    }));
  }, []);

  const clearAddress = useCallback(() => {
    setAddressData(defaultAddressData);
  }, []);

  const setError = useCallback((field: keyof AddressData['errors'], message: string) => {
    setAddressData((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setAddressData((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: AddressData['errors'] = {};

    if (!addressData.connectionType) {
      errors.connectionType = 'Выберите тип подключения';
    }

    if (!addressData.cityId && !addressData.city) {
      errors.city = 'Укажите населённый пункт';
    }

    if (!addressData.streetId && !addressData.street) {
      errors.street = 'Укажите улицу';
    }

    if (!addressData.buildingId && !addressData.houseNumber) {
      errors.houseNumber = 'Укажите номер дома';
    }

    // Ввод квартиры будет позже, не валидируем здесь

    if (!addressData.privacyConsent) {
      errors.privacyConsent = 'Необходимо согласие с политикой конфиденциальности';
    }

    setAddressData((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [addressData]);

  const value: AddressContextType = {
    addressData,
    updateConnectionType,
    updateCity,
    updateStreet,
    updateHouseNumber,
    updateCorpusNumber,
    updateEntrance,
    updateFloor,
    updateApartmentNumber,
    updatePrivacyConsent,
    clearAddress,
    validateForm,
    clearErrors,
    setError,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
};
