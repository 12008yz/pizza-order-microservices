/**
 * Константы для Order Service
 */

// HTTP таймауты (в миллисекундах)
export const HTTP_TIMEOUT = 10000; // 10 секунд
export const HTTP_RETRY_TIMEOUT = 3000; // 3 секунды для retry

// Цены оборудования (по умолчанию, если не получены из Equipment Service)
export const ROUTER_PURCHASE_PRICE = 2000;
export const ROUTER_RENT_PRICE = 200; // Ежемесячная аренда
export const TV_SETTOP_PURCHASE_PRICE = 3000;
export const TV_SETTOP_RENT_PRICE = 300; // Ежемесячная аренда
export const SIM_CARD_PRICE = 0; // SIM-карта обычно бесплатна

// Лимиты
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_BASE = 1000; // Базовая задержка для exponential backoff

// Валидация
export const PHONE_MIN_LENGTH = 10;
export const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;
