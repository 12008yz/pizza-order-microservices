FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3006

CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]
