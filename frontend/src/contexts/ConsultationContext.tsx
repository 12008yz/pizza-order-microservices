'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ContactMethod = 'max' | 'telegram' | 'call' | '';

export interface ConsultationData {
  phone: string;
  contactMethod: ContactMethod;
  errors: {
    phone?: string;
    contactMethod?: string;
  };
}

interface ConsultationContextType {
  consultationData: ConsultationData;
  updatePhone: (phone: string) => void;
  updateContactMethod: (method: ContactMethod) => void;
  clearConsultation: () => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  setError: (field: keyof ConsultationData['errors'], message: string) => void;
}

const defaultConsultationData: ConsultationData = {
  phone: '',
  contactMethod: '',
  errors: {},
};

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consultationData, setConsultationData] = useState<ConsultationData>(defaultConsultationData);

  const updatePhone = useCallback((phone: string) => {
    setConsultationData((prev) => ({
      ...prev,
      phone,
      errors: { ...prev.errors, phone: undefined },
    }));
  }, []);

  const updateContactMethod = useCallback((method: ContactMethod) => {
    setConsultationData((prev) => ({
      ...prev,
      contactMethod: method,
      errors: { ...prev.errors, contactMethod: undefined },
    }));
  }, []);

  const clearConsultation = useCallback(() => {
    setConsultationData(defaultConsultationData);
  }, []);

  const setError = useCallback((field: keyof ConsultationData['errors'], message: string) => {
    setConsultationData((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setConsultationData((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: ConsultationData['errors'] = {};

    if (!consultationData.phone || consultationData.phone.length < 10) {
      errors.phone = 'Введите корректный номер телефона';
    }

    if (!consultationData.contactMethod) {
      errors.contactMethod = 'Выберите способ связи';
    }

    setConsultationData((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [consultationData]);

  const value: ConsultationContextType = {
    consultationData,
    updatePhone,
    updateContactMethod,
    clearConsultation,
    validateForm,
    clearErrors,
    setError,
  };

  return <ConsultationContext.Provider value={value}>{children}</ConsultationContext.Provider>;
};

export const useConsultation = (): ConsultationContextType => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
};
