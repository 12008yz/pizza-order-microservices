'use client';

import { useState, useCallback } from 'react';

export function usePhoneInput(initialValue: string = '') {
  const [phone, setPhone] = useState(initialValue);

  const formatPhone = useCallback((value: string): string => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    
    // Применяем маску +7 (XXX) XXX-XX-XX
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }, []);

  const handleChange = useCallback((value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
  }, [formatPhone]);

  return {
    phone,
    setPhone: handleChange,
  };
}
