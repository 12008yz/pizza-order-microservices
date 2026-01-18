-- Миграция для добавления индексов в Availability Service
-- Улучшает производительность быстрого поиска по ID адреса

-- Индексы для таблицы technical_access
CREATE INDEX IF NOT EXISTS idx_technical_access_building_id ON technical_access(building_id);
CREATE INDEX IF NOT EXISTS idx_technical_access_apartment_id ON technical_access(apartment_id);
CREATE INDEX IF NOT EXISTS idx_technical_access_provider_id ON technical_access(provider_id);
CREATE INDEX IF NOT EXISTS idx_technical_access_is_available ON technical_access(is_available);
CREATE INDEX IF NOT EXISTS idx_technical_access_building_provider ON technical_access(building_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_technical_access_apartment_provider ON technical_access(apartment_id, provider_id);

-- Индексы для таблицы availability_cache
CREATE INDEX IF NOT EXISTS idx_availability_cache_address_hash ON availability_cache(address_hash);
CREATE INDEX IF NOT EXISTS idx_availability_cache_expires_at ON availability_cache(expires_at);
