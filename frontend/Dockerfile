FROM node:20-alpine

WORKDIR /app

# На Render можно убрать зеркало (оставить по умолчанию registry.npmjs.org)
# Локально в Китае/РФ раскомментируйте следующую строку:
# RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

# Render передаёт PORT (обычно 10000); Next.js слушает этот порт
CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
