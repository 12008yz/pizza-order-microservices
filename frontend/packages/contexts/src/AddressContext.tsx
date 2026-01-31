'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { AddressData, ConnectionType } from '@tariff/shared-types';

const defaultAddressData: AddressData = {
  connectionType: '',
  privacyConsent: false,
  errors: {},
};

interface AddressContextType {
  addressData: AddressData;
  updateConnectionType: (type: ConnectionType) => void;
  updateCity: (cityId?: number, city?: string, regionId?: number) => void;
  updateStreet: (streetId?: number, street?: string) => void;
  updateHouseNumber: (buildingId?: number, houseNumber?: string, apartmentId?: number) => void;
  updateEntrance: (entrance?: number) => void;
  updateFloor: (floor?: number) => void;
  updateApartmentNumber: (apartmentId?: number, apartmentNumber?: string) => void;
  updatePrivacyConsent: (consent: boolean) => void;
  clearAddress: () => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  setError: (field: keyof AddressData['errors'], message: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addressData, setAddressData] = useState<AddressData>(defaultAddressData);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem('addressFormData');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAddressData({ ...parsed, errors: {} });
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    try {
      const dataToSave = { ...addressData, errors: {} };
      sessionStorage.setItem('addressFormData', JSON.stringify(dataToSave));
    } catch {
      // ignore
    }
  }, [addressData, isHydrated]);

  const updateConnectionType = useCallback((type: ConnectionType) => {
    setAddressData((prev) => ({ ...prev, connectionType: type, errors: { ...prev.errors, connectionType: undefined } }));
  }, []);

  const updateCity = useCallback((cityId?: number, city?: string, regionId?: number) => {
    setAddressData((prev) => ({
      ...prev,
      cityId,
      city,
      regionId,
      streetId: undefined,
      street: undefined,
      buildingId: undefined,
      houseNumber: undefined,
      apartmentId: undefined,
      errors: { ...prev.errors, city: undefined, street: undefined, houseNumber: undefined },
    }));
  }, []);

  const updateStreet = useCallback((streetId?: number, street?: string) => {
    setAddressData((prev) => ({
      ...prev,
      streetId,
      street,
      buildingId: undefined,
      houseNumber: undefined,
      apartmentId: undefined,
      errors: { ...prev.errors, street: undefined, houseNumber: undefined },
    }));
  }, []);

  const updateHouseNumber = useCallback((buildingId?: number, houseNumber?: string, apartmentId?: number) => {
    setAddressData((prev) => ({
      ...prev,
      buildingId,
      houseNumber,
      entrance: undefined,
      floor: undefined,
      apartmentId: apartmentId ?? undefined,
      apartmentNumber: apartmentId ? prev.apartmentNumber : undefined,
      errors: { ...prev.errors, houseNumber: undefined, apartmentNumber: undefined },
    }));
  }, []);

  const updateEntrance = useCallback((entrance?: number) => {
    setAddressData((prev) => ({
      ...prev,
      entrance,
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
      apartmentId: undefined,
      apartmentNumber: undefined,
      errors: { ...prev.errors, apartmentNumber: undefined },
    }));
  }, []);

  const updateApartmentNumber = useCallback((apartmentId?: number, apartmentNumber?: string) => {
    setAddressData((prev) => ({ ...prev, apartmentId, apartmentNumber, errors: { ...prev.errors, apartmentNumber: undefined } }));
  }, []);

  const updatePrivacyConsent = useCallback((consent: boolean) => {
    setAddressData((prev) => ({ ...prev, privacyConsent: consent, errors: { ...prev.errors, privacyConsent: undefined } }));
  }, []);

  const clearAddress = useCallback(() => setAddressData(defaultAddressData), []);

  const setError = useCallback((field: keyof AddressData['errors'], message: string) => {
    setAddressData((prev) => ({ ...prev, errors: { ...prev.errors, [field]: message } }));
  }, []);

  const clearErrors = useCallback(() => {
    setAddressData((prev) => ({ ...prev, errors: {} }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: AddressData['errors'] = {};
    if (!addressData.connectionType) errors.connectionType = 'Выберите тип подключения';
    if (!addressData.cityId && !addressData.city) errors.city = 'Укажите населённый пункт';
    if (!addressData.streetId && !addressData.street) errors.street = 'Укажите улицу';
    if (!addressData.buildingId && !addressData.houseNumber) errors.houseNumber = 'Укажите номер дома';
    if (!addressData.privacyConsent) errors.privacyConsent = 'Необходимо согласие с политикой конфиденциальности';
    setAddressData((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [addressData]);

  const value: AddressContextType = {
    addressData,
    updateConnectionType,
    updateCity,
    updateStreet,
    updateHouseNumber,
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

export function useAddress(): AddressContextType {
  const context = useContext(AddressContext);
  if (!context) throw new Error('useAddress must be used within AddressProvider');
  return context;
}

export type { AddressData, ConnectionType } from '@tariff/shared-types';
