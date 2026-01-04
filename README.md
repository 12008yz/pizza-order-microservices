# Tariff Aggregator Microservices Application

Fullstack микросервисное приложение-агрегатор интернет-провайдеров и тарифов на Next.js, PostgreSQL и Sequelize.

## Описание

Сайт-агрегатор, где пользователи могут:

- Проверить доступность интернет-провайдеров по своему адресу
- Сравнить тарифы по цене, скорости, дополнительным услугам
- Оставить заявку на подключение к выбранному провайдеру
- Читать отзывы о провайдерах

## Архитектура

Приложение состоит из следующих микросервисов:

- **Auth Service** (порт 3001) - Аутентификация и авторизация (JWT)

  - База данных: `auth_db`
  - Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/verify`

- **User Service** (порт 3002) - Управление пользователями

  - База данных: `user_db`
  - Endpoints: `/api/users/profile` (GET, PUT)

- **Provider Service** (порт 3003) - Управление провайдерами, тарифами и покрытием

  - База данных: `provider_db`
  - Endpoints:
    - `/api/providers` (GET, POST), `/api/providers/:id` (GET, PUT)
    - `/api/tariffs` (GET, POST), `/api/tariffs/:id` (GET, PUT, DELETE), `/api/tariffs/by-address` (GET)
    - `/api/coverage/check` (GET), `/api/coverage/cities` (GET), `/api/coverage/streets` (GET)

- **Application Service** (порт 3004) - Обработка заявок на подключение

  - База данных: `application_db`
  - Endpoints: `/api/applications` (GET, POST), `/api/applications/my` (GET), `/api/applications/:id` (GET), `/api/applications/:id/status` (PUT), `/api/applications/:id/assign` (PUT)

- **Frontend** (порт 3000) - Next.js приложение (API Gateway)
  - Проксирует запросы к микросервисам через API routes

Каждый сервис имеет свою собственную базу данных PostgreSQL и работает в отдельном Docker контейнере.

## Структура проекта

```
.
├── services/
│   ├── auth-service/          # Сервис аутентификации
│   ├── user-service/          # Сервис пользователей
│   ├── provider-service/       # Сервис провайдеров и тарифов
│   └── application-service/   # Сервис заявок на подключение
├── frontend/                   # Next.js приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # API Gateway routes
│   │   │   └── page.tsx       # Главная страница
│   │   └── ...
│   └── Dockerfile
├── docker-compose.yml          # Оркестрация всех сервисов
└── README.md
```

## Быстрый старт

### Требования

- **Docker и Docker Compose** (рекомендуется)
- Node.js 20+ (только для локальной разработки)

### Первый запуск (Docker)

```bash
# Сборка и запуск всех сервисов и баз данных
docker-compose up --build

# Или в фоновом режиме
docker-compose up --build -d
```

**Важно:** Docker автоматически создаст все базы данных и контейнеры при первом запуске!

Подробная инструкция: см. [GETTING_STARTED.md](./GETTING_STARTED.md)

### Пакетные менеджеры

Для локальной разработки можно использовать:

- **npm** (рекомендуется) - используется в Dockerfile'ах
- **yarn** - альтернатива npm
- **pnpm** - эффективный по дисковому пространству

В Docker контейнерах всегда используется `npm`.

### Полезные команды Docker

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Остановка с удалением volumes (БД)
docker-compose down -v

# Пересборка конкретного сервиса
docker-compose build provider-service && docker-compose up -d provider-service
```

### Локальная разработка

Для разработки без Docker:

1. Установите PostgreSQL локально
2. Создайте базы данных для каждого сервиса
3. Настройте `.env` файлы в каждом сервисе
4. Запустите каждый сервис отдельно:

```bash
# Auth Service
cd services/auth-service
npm install
npm run dev

# User Service
cd services/user-service
npm install
npm run dev

# Provider Service
cd services/provider-service
npm install
npm run dev
npm run seed  # Заполнить тестовыми данными

# Application Service
cd services/application-service
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Доступ к приложению

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Provider Service**: http://localhost:3003
- **Application Service**: http://localhost:3004

## Базы данных

Каждый сервис использует свою базу данных PostgreSQL:

- `auth_db` (порт 5432)
- `user_db` (порт 5433)
- `provider_db` (порт 5434)
- `application_db` (порт 5435)

## Технологии

- **Next.js 14** - Frontend и API Gateway
- **PostgreSQL 15** - База данных
- **Sequelize 6** - ORM
- **TypeScript** - Типизация
- **Docker & Docker Compose** - Контейнеризация
- **Express** - Backend сервисы
- **JWT** - Аутентификация
- **Winston** - Логирование

## Лучшие практики

1. **Разделение ответственности** - каждый сервис отвечает за свою область
2. **Независимые БД** - каждый сервис имеет свою базу данных
3. **API Gateway** - централизованная точка входа через Next.js
4. **Типизация** - полная типизация на TypeScript
5. **Обработка ошибок** - централизованная обработка ошибок
6. **Логирование** - структурированное логирование через Winston
7. **Валидация** - валидация входных данных
8. **Безопасность** - Helmet, CORS, JWT токены

## Разработка

### Добавление нового сервиса

1. Создайте папку в `services/`
2. Скопируйте структуру из существующего сервиса
3. Добавьте сервис в `docker-compose.yml`
4. Создайте соответствующую БД
5. Добавьте API routes в `frontend/src/app/api/`

### Миграции

```bash
# В каждом сервисе
npm run migrate        # Применить миграции
npm run migrate:undo   # Откатить последнюю миграцию
```

### Сидеры

```bash
# Заполнение тестовыми данными (Provider Service)
cd services/provider-service
npm run seed
```

## Лицензия

ISC
