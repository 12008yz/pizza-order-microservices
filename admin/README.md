# CRM Админ-панель

Админка для управления заявками на подключение интернета. Работает с микросервисами (auth, order, location, provider).

## Стек

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Bun или npm

## Запуск локально

```bash
# Установка (Bun или npm)
cd admin
bun install   # или npm install

# Переменные окружения
cp .env.local.example .env.local
# Отредактируйте .env.local при необходимости (URL сервисов по умолчанию localhost:3001–3007)

# Режим разработки (порт 3100)
bun run dev   # или npm run dev
```

Откройте http://localhost:3100. Страница входа: `/login`.

## Запуск через Docker

Из корня репозитория:

```bash
docker compose up admin
```

Админка будет доступна на http://localhost:3100.

## Структура

- `/login` — вход (POST /api/auth/admin/login)
- `/orders` — список заявок (фильтры, поиск, пагинация)
- `/orders/[id]` — карточка заявки
- `/addresses` — база адресов (выбор региона → город → улица → здания)
- `/addresses/new` — форма «Проникновение» (создание здания)
- `/tariffs` — база тарифов
- `/tariffs/new` — форма «Предложение» (создание тарифа)

## API

Админка обращается к сервисам по URL из `NEXT_PUBLIC_*`. В браузере запросы идут с хоста пользователя, поэтому в `.env.local` указывайте адреса, доступные с вашей машины (например `http://localhost:3001`).
