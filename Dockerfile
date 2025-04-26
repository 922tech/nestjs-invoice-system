# Stage 1: Build the application
FROM node:22.15.0-alpine AS builder


WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./


COPY . .

RUN yarn build

FROM node:22.15.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./

EXPOSE 3000

CMD ["node", "dist/main.js"]