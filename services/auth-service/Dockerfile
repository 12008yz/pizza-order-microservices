FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3001

# Запускаем миграции, сборку и сервер
CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]

