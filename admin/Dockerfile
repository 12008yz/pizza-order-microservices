FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3100

CMD ["sh", "-c", "npx next start -p ${PORT:-3100}"]
