# Микрофронтенды (монорепа)

Фронт разбит на **shell** (шлюз + API) и три приложения: **main**, **equipment**, **order**.

## Структура

- **apps/shell** — единая точка входа (порт 3000). Проксирует `/` и `/providers` → main, `/equipment` → equipment, `/order` → order. Содержит все API-роуты (`/api/*`).
- **apps/main** — главный сценарий: адрес (Frame1), провайдеры и тарифы (Frame2, Frame3). Порт 3001.
- **apps/equipment** — выбор оборудования (Frame4). Порт 3002, basePath `/equipment`.
- **apps/order** — оформление заявки (Frame5). Порт 3003, basePath `/order`.

- **packages/shared-types** — общие типы (API, адрес, оборудование).
- **packages/api-client** — axios-клиент и сервисы (orders, tariffs, locations и т.д.).
- **packages/contexts** — React-контексты (Address, Equipment).
- **packages/ui** — общие компоненты (Button, Input, BaseModal, HomeIcon).

## Запуск

1. Установка зависимостей из корня фронта:

   ```bash
   cd frontend
   npm install
   ```

2. Сборка пакетов (типы и api-client, если нужен dist):

   ```bash
   npm run build --workspace=@tariff/shared-types
   npm run build --workspace=@tariff/api-client
   ```

   (Если пакеты используются по `src` и транспилируются Next.js, этот шаг можно пропустить.)

3. Запуск всех приложений (в разных терминалах):

   ```bash
   npm run dev:main      # main на 3001
   npm run dev:equipment # equipment на 3002
   npm run dev:order     # order на 3003
   npm run dev           # shell на 3000
   ```

4. Открыть в браузере **http://localhost:3000**. Shell проксирует запросы на нужное приложение.

## Деплой

- **Shell** — один домен, отдаёт HTML по путям и проксирует на соответствующие приложения (или на статику/сервисы).
- **Main, equipment, order** — отдельные деплои; в production переменные `MAIN_APP_URL`, `EQUIPMENT_APP_URL`, `ORDER_APP_URL` в shell задают URL этих приложений.

## Переходы между приложениями

Из equipment и order навигация на `/`, `/providers`, `/order`, `/equipment` делается через `window.location.href`, чтобы всегда идти через shell (единый origin и роутинг).
