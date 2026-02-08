'use client';

import { useCallback } from 'react';

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  let rest = digits;
  if (digits.startsWith('8')) {
    rest = digits.slice(1);
  } else if (digits.startsWith('7')) {
    rest = digits.slice(1);
  } else if (digits.length > 0) {
    rest = digits;
  }
  if (rest.length === 0) return '+7';

  let formatted = '+7';
  if (rest.length > 0) formatted += ' ' + rest.slice(0, 3);
  if (rest.length > 3) formatted += ' ' + rest.slice(3, 6);
  if (rest.length > 6) formatted += ' ' + rest.slice(6, 8);
  if (rest.length > 8) formatted += ' ' + rest.slice(8, 10);

  return formatted;
}

export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';

  let formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += '.' + digits.slice(2, 4);
  if (digits.length > 4) formatted += '.' + digits.slice(4, 8);

  return formatted;
}

export function usePhoneInput() {
  const format = useCallback(formatPhone, []);
  const formatDate = useCallback(formatBirthDate, []);

  return {
    formatPhone: format,
    formatBirthDate: formatDate,
  };
}
