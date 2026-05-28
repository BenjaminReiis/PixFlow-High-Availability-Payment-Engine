FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

RUN npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
