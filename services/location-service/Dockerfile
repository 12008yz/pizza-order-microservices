FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm install --legacy-peer-deps

EXPOSE 3005

CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]
