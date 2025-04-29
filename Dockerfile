FROM node:22.15.0-alpine AS builder


WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./


COPY . .

RUN yarn add migrate-mongo
RUN yarn build

FROM node:22.15.0-alpine

WORKDIR /app
COPY migrate-mongo-config.js ./
COPY migrations ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./

EXPOSE 3000
