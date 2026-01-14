/**
 * Утилита для нормализации адресов
 * Приводит названия городов и улиц к единому формату для корректного поиска
 */

/**
 * Нормализует название города
 * Примеры:
 * - "г. Москва" → "москва"
 * - "Москва " → "москва"
 * - "Санкт-Петербург" → "санкт-петербург"
 */
export function normalizeCity(city: string): string {
  if (!city) return '';
  
  let normalized = city
    .trim()                                    // убираем пробелы в начале/конце
    .replace(/^город\s*/i, '')                // убираем "город" в начале (с пробелом или без) - ПЕРВЫМ!
    .replace(/^г\.?\s*/i, '')                 // убираем "г." или "г " в начале
    .replace(/\s+/g, ' ')                     // множественные пробелы → один
    .toLowerCase()                             // приводим к нижнему регистру
    .trim();
  
  // Убираем "и" после приведения к lowercase
  normalized = normalized.replace(/\bи\b/g, '').trim();
  
  return normalized;
}

/**
 * Нормализует название улицы
 * Примеры:
 * - "ул. Тверская" → "тверская"
 * - "Тверская ул." → "тверская"
 * - "проспект Ленина" → "ленина"
 */
export function normalizeStreet(street: string | null | undefined): string | null {
  if (!street) return null;
  
  let normalized = street
    .trim()
    .replace(/^(ул\.?|улица|проспект|пр\.?|переулок|пер\.?|бульвар|бул\.?|площадь|пл\.?|набережная|наб\.?|шоссе|ш\.?|тупик|туп\.?)\s*/i, '') // убираем тип улицы в начале (с пробелом или без)
    .replace(/\s*(ул\.?|улица|проспект|пр\.?|переулок|пер\.?|бульвар|бул\.?|площадь|пл\.?|набережная|наб\.?|шоссе|ш\.?|тупик|туп\.?)$/i, '') // убираем тип улицы в конце (с пробелом или без)
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
  
  // Если после нормализации осталась пустая строка, возвращаем null
  return normalized || null;
}

/**
 * Нормализует название района
 */
export function normalizeDistrict(district: string | null | undefined): string | null {
  if (!district) return null;
  
  const normalized = district
    .trim()
    .replace(/^район\s+/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
  
  // Если после нормализации осталась пустая строка, возвращаем null
  return normalized || null;
}

/**
 * Создает поисковый паттерн для частичного совпадения
 * Используется для поиска с учетом вариаций написания
 */
export function createSearchPattern(text: string): string {
  const normalized = normalizeCity(text);
  // Можно добавить логику для обработки сокращений
  // Например: "СПб" → "санкт-петербург"
  return normalized;
}
