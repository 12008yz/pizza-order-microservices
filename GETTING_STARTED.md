# Инструкция по первому запуску

## Выбор пакетного менеджера

Для локальной разработки вы можете использовать:
- **npm** (рекомендуется) - стандартный менеджер Node.js, уже используется в Dockerfile'ах
- **yarn** - альтернатива npm, быстрее в некоторых случаях
- **pnpm** - эффективный по использованию дискового пространства

**Важно:** В Docker контейнерах используется `npm`, так что локально можете использовать любой менеджер, но в контейнерах всегда будет npm.

## Первый запуск через Docker (рекомендуется)

### Шаг 1: Убедитесь, что Docker установлен

```bash
docker --version
docker-compose --version
```

### Шаг 2: Запустите все сервисы

```bash
# Сборка и запуск всех контейнеров
docker-compose up --build

# Или в фоновом режиме
docker-compose up --build -d
```

**Что произойдет:**
1. Docker скачает образы PostgreSQL и Node.js (если их нет)
2. Создаст 4 контейнера с PostgreSQL (базы данных)
3. Создаст 4 контейнера с микросервисами
4. Создаст 1 контейнер с Next.js frontend
5. Автоматически создаст все базы данных
6. Запустит миграции (если есть)
7. Запустит все сервисы

### Шаг 3: Дождитесь запуска

Вы увидите логи всех сервисов. Дождитесь сообщений типа:
```
Auth Service running on port 3001
User Service running on port 3002
Product Service running on port 3003
Order Service running on port 3004
```

### Шаг 4: Откройте приложение

- **Frontend**: http://localhost:3000
- **Auth Service Health**: http://localhost:3001/health
- **User Service Health**: http://localhost:3002/health
- **Product Service Health**: http://localhost:3003/health
- **Order Service Health**: http://localhost:3004/health

## Локальная разработка (без Docker)

Если хотите запускать сервисы локально:

### Требования

1. **PostgreSQL** - установите локально или используйте Docker только для БД
2. **Node.js 20+**

### Шаг 1: Создайте базы данных

```sql
-- Подключитесь к PostgreSQL и выполните:
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;
```

### Шаг 2: Настройте переменные окружения

Создайте `.env` файлы в каждом сервисе:

**services/auth-service/.env**
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

**services/user-service/.env**
```env
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_db
DB_USER=postgres
DB_PASSWORD=your_password
AUTH_SERVICE_URL=http://localhost:3001
```

**services/product-service/.env**
```env
NODE_ENV=development
PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_db
DB_USER=postgres
DB_PASSWORD=your_password
```

**services/order-service/.env**
```env
NODE_ENV=development
PORT=3004
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_db
DB_USER=postgres
DB_PASSWORD=your_password
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
```

**frontend/.env.local**
```env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
```

### Шаг 3: Установите зависимости

```bash
# Auth Service
cd services/auth-service
npm install  # или yarn install / pnpm install
npm run migrate

# User Service
cd ../user-service
npm install
npm run migrate

# Product Service
cd ../product-service
npm install
npm run migrate
npm run seed  # Заполнит базу тестовыми данными

# Order Service
cd ../order-service
npm install
npm run migrate

# Frontend
cd ../../frontend
npm install
```

### Шаг 4: Запустите сервисы

Откройте отдельные терминалы для каждого сервиса:

```bash
# Терминал 1 - Auth Service
cd services/auth-service
npm run dev

# Терминал 2 - User Service
cd services/user-service
npm run dev

# Терминал 3 - Product Service
cd services/product-service
npm run dev

# Терминал 4 - Order Service
cd services/order-service
npm run dev

# Терминал 5 - Frontend
cd frontend
npm run dev
```

## Полезные команды Docker

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f auth-service

# Остановка всех сервисов
docker-compose stop

# Остановка и удаление контейнеров
docker-compose down

# Остановка с удалением volumes (удалит все данные БД!)
docker-compose down -v

# Пересборка конкретного сервиса
docker-compose build auth-service
docker-compose up -d auth-service

# Вход в контейнер
docker exec -it pizza-auth-service sh

# Подключение к базе данных
docker exec -it pizza-auth-db psql -U auth_user -d auth_db
```

## Проверка работоспособности

### 1. Проверьте health checks

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### 2. Проверьте регистрацию

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Проверьте получение продуктов

```bash
curl http://localhost:3003/api/products
```

## Решение проблем

### Проблема: Порты заняты

Если порты 3000-3004 или 5432-5435 заняты, измените их в `docker-compose.yml`

### Проблема: Ошибки подключения к БД

Убедитесь, что:
1. Базы данных созданы (при локальной разработке)
2. Переменные окружения настроены правильно
3. PostgreSQL запущен

### Проблема: Сервисы не запускаются

Проверьте логи:
```bash
docker-compose logs [service-name]
```

### Проблема: Миграции не выполняются

Убедитесь, что:
1. Sequelize CLI установлен: `npm install -g sequelize-cli`
2. Файлы миграций существуют
3. База данных доступна

## Следующие шаги

После успешного запуска:
1. Откройте http://localhost:3000
2. Зарегистрируйтесь
3. Просмотрите меню пицц
4. Создайте заказ

