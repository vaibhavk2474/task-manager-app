FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts index.html eslint.config.js ./
COPY src ./src
COPY public ./public

EXPOSE 5175

CMD ["npm", "run", "dev"]
