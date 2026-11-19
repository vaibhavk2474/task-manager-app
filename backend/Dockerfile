FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY eslint.config.js ./
COPY src ./src

EXPOSE 3002

CMD ["npm", "run", "dev"]
