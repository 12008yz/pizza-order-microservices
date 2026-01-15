# Тесты для Auth Service

## Установка зависимостей

Перед запуском тестов убедитесь, что установлены все зависимости:

```bash
cd services/auth-service
npm install
```

## Запуск тестов

### Запустить все тесты:
```bash
npm test
```

### Запустить тесты в watch режиме (автоматический перезапуск при изменениях):
```bash
npm run test:watch
```

### Запустить тесты с покрытием кода:
```bash
npm run test:coverage
```

## Структура тестов

```
src/__tests__/
├── setup.ts                          # Настройка тестового окружения
├── services/
│   └── auth.service.test.ts          # Unit-тесты для AuthService
├── controllers/
│   └── auth.controller.test.ts       # Unit-тесты для AuthController
└── integration/
    └── auth.api.test.ts              # Интеграционные тесты API
```

## Что тестируется

### AuthService (`auth.service.test.ts`)
- ✅ Регистрация пользователя
- ✅ Ошибка при существующем email
- ✅ Хеширование пароля
- ✅ Успешный вход
- ✅ Ошибка при неверном email
- ✅ Ошибка при неверном пароле
- ✅ Обновление токена
- ✅ Ошибки при невалидном refresh token
- ✅ Выход из системы

### AuthController (`auth.controller.test.ts`)
- ✅ POST /register - регистрация
- ✅ POST /login - вход
- ✅ POST /refresh - обновление токена
- ✅ POST /logout - выход
- ✅ GET /verify - проверка токена
- ✅ Обработка ошибок

### Интеграционные тесты (`auth.api.test.ts`)
- ✅ Полный flow аутентификации
- ✅ Все API endpoints
- ✅ Обработка ошибок на уровне API

## Покрытие кода

После запуска `npm run test:coverage` результаты будут в папке `coverage/`.

Откройте `coverage/index.html` в браузере для просмотра детального отчета.
