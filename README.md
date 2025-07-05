# Invoice System

This project is a microservices-based Invoice System built with [NestJS](https://nestjs.com/) and designed to demonstrate robust invoice management with a focus on modularity, scalability, and event-driven architecture. The system leverages [RabbitMQ](https://www.rabbitmq.com/) as a message broker and [MongoDB](https://www.mongodb.com/) for data storage.

## Features

- Modular architecture with two primary services:
  - **Web App (API/App Service)**: Provides REST API endpoints, authentication, and invoice management.
  - **Worker Service**: Handles background jobs and messaging.
- Asynchronous inter-service communication using RabbitMQ.
- MongoDB for persistent data storage.
- JWT-based authentication.
- API documentation via Swagger (available at `/api`).

## Services Overview

### 1. Web App (API/App Service)
- NestJS-based backend, exposes HTTP API for invoice operations.
- Connects to MongoDB for invoice data storage.
- Sends and receives messages via RabbitMQ.
- Exposes Swagger API docs at `/api`.

### 2. Worker Service
- Runs as a separate container/process.
- Listens to RabbitMQ queues for background processing (e.g., notifications, async tasks).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for local development)
- (Optional) Local installations of MongoDB and RabbitMQ

### Running with Docker Compose

The project includes a `docker-compose.yml` that sets up:

- RabbitMQ (management UI on `:15672`)
- MongoDB
- Web App (`invoice_manager_app`)
- Worker Service (`invoice_manager_worker`)

Start everything:

```bash
docker-compose up --build
```

- Web API: [http://localhost:3000](http://localhost:3000)
- Swagger docs: [http://localhost:3000/api](http://localhost:3000/api)
- RabbitMQ UI: [http://localhost:15672](http://localhost:15672) (user/pass: guest/guest)
- MongoDB: [mongodb://admin:1234@localhost:27017](mongodb://admin:1234@localhost:27017)

### Environment Variables

You can override service settings via environment variables or `.env` files. Key variables include:

- `APP_PORT` (default: 3000)
- `MONGO_CONNECTION_STRING` (default: mongodb://admin:1234@mongo:27017)
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `RABBITMQ_URL` (default: amqp://guest:guest@rabbitmq:5672)
- `RABBITMQ_DEFAULT_QUEUE`
- `DATABASE_NAME` (default: invoices)

### Scripts

- `npm run start:dev` – Start in development mode
- `npm run start:prod` – Start in production mode
- `npm run migrate` – Run database migrations

## Project Structure

- `src/` – Main application source code
- `docker-compose.yml` – Multi-service setup for local dev
- `package.json` – Dependencies and scripts

## Technologies Used

- **NestJS** (API framework)
- **RabbitMQ** (messaging)
- **MongoDB** (database)
- **JWT** (auth)
- **Swagger** (API docs)
- **Docker** (containerization)

## License

This project is UNLICENSED and intended for internal or demonstration use only.

---
**922tech / nestjs-invoice-system**
