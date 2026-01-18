-- Миграция для добавления индексов в Provider Service
-- Улучшает производительность запросов покрытия

-- Индексы для таблицы coverage
CREATE INDEX IF NOT EXISTS idx_coverage_city ON coverage(city);
CREATE INDEX IF NOT EXISTS idx_coverage_city_street ON coverage(city, street);
CREATE INDEX IF NOT EXISTS idx_coverage_provider_id ON coverage(provider_id);
CREATE INDEX IF NOT EXISTS idx_coverage_city_street_house ON coverage(city, street, house_from, house_to);

-- Индексы для таблицы providers
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);

-- Индексы для таблицы tariffs
CREATE INDEX IF NOT EXISTS idx_tariffs_provider_id ON tariffs(provider_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_is_active ON tariffs(is_active);
CREATE INDEX IF NOT EXISTS idx_tariffs_price ON tariffs(price);
