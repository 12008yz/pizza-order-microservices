FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --prefer-offline

COPY . .

EXPOSE 3002

CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]
