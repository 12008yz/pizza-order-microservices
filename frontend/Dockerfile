FROM node:20-alpine

WORKDIR /app

# Копируем package files для кеширования слоя зависимостей
COPY package*.json ./

# Устанавливаем зависимости (кеш будет использован, если package.json не изменился)
RUN npm install

# Копируем остальные файлы
COPY . .

# НЕ делаем сборку здесь - переменные окружения будут доступны только в runtime
# Сборка будет выполнена в CMD с доступом к переменным окружения

EXPOSE 3000

# В development режиме используем next dev (не требует сборки)
# В production можно использовать next start
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm start; else npm run dev; fi"]

