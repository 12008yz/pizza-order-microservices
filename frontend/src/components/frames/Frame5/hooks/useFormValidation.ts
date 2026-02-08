'use client';

import { useCallback } from 'react';
import type { PersonalData, AddressData, ValidationErrors } from '../types';

export function validatePersonalData(data: PersonalData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'Введите имя';
  } else if (data.firstName.length < 2) {
    errors.firstName = 'Минимум 2 символа';
  } else if (!/^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(data.firstName)) {
    errors.firstName = 'Только буквы';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Введите фамилию';
  } else if (data.lastName.length < 2) {
    errors.lastName = 'Минимум 2 символа';
  } else if (!/^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(data.lastName)) {
    errors.lastName = 'Только буквы';
  }

  if (!data.birthDate || data.birthDate.length < 10) {
    errors.birthDate = 'Введите дату рождения';
  } else {
    const parts = data.birthDate.split('.');
    if (parts.length !== 3) {
      errors.birthDate = 'Формат ДД.ММ.ГГГГ';
    } else {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const fullAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      if (isNaN(birthDate.getTime()) || fullAge < 18) {
        errors.birthDate = 'Возраст должен быть 18+';
      }
    }
  }

  const phoneDigits = data.phone.replace(/\D/g, '');
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
    errors.phone = 'Введите полный номер';
  }

  return errors;
}

export function validateAddressData(data: AddressData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.city.trim()) {
    errors.city = 'Укажите город';
  }
  if (!data.street.trim()) {
    errors.street = 'Укажите улицу';
  }
  if (!data.building.trim()) {
    errors.building = 'Укажите дом';
  }
  if (!data.apartment) {
    errors.apartment = 'Выберите квартиру';
  }

  return errors;
}

export function useFormValidation() {
  const validatePersonal = useCallback(validatePersonalData, []);
  const validateAddress = useCallback(validateAddressData, []);

  return {
    validatePersonalData: validatePersonal,
    validateAddressData: validateAddress,
  };
}
