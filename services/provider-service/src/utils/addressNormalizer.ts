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

  // Убираем "и" как отдельное слово (с пробелами вокруг) и убираем лишние пробелы
  normalized = normalized.replace(/\s+и\s+/g, ' ').replace(/\s+/g, ' ').trim();

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
    // Убираем тип улицы в начале (с пробелом или без) - сначала длинные варианты, потом короткие
    .replace(/^(улица\s*|проспект\s+|переулок\s+|бульвар\s+|площадь\s+|набережная\s+|шоссе\s+|тупик\s+|ул\.?\s*|пр\.?\s*|пер\.?\s*|бул\.?\s*|пл\.?\s*|наб\.?\s*|ш\.?\s*|туп\.?\s*)/i, '')
    // Убираем тип улицы в конце (с пробелом или без) - сначала длинные варианты, потом короткие
    .replace(/\s*(улица|проспект|переулок|бульвар|площадь|набережная|шоссе|тупик|ул\.?|пр\.?|пер\.?|бул\.?|пл\.?|наб\.?|ш\.?|туп\.?)$/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

  // Если после нормализации осталась пустая строка или только тип улицы, возвращаем null
  if (!normalized || normalized.length === 0) {
    return null;
  }

  return normalized;
}

/**
 * Нормализует название района
 */
export function normalizeDistrict(district: string | null | undefined): string | null {
  if (!district) return null;

  let normalized = district
    .trim()
    .replace(/^район\s+/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

  // Если после нормализации осталась пустая строка или только слово "район", возвращаем null
  if (!normalized || normalized.length === 0 || normalized === 'район') {
    return null;
  }

  return normalized;
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
