FROM node:20-alpine

WORKDIR /app

# Копируем package files для кеширования слоя зависимостей
COPY package*.json ./

# Устанавливаем зависимости (кеш будет использован, если package.json не изменился)
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3001

# Запускаем миграции, сборку и сервер
CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]

