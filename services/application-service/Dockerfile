FROM node:20-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install --legacy-peer-deps --prefer-offline

COPY . .

EXPOSE 3004

CMD ["sh", "-c", "npx sequelize-cli db:migrate || true && npm run build && npm start"]
