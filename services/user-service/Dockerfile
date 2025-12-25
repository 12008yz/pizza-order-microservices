FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]

