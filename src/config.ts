const config = {
  app: {
    name: process.env.APP_NAME || 'InvoiceSystem',
    port: parseInt(process.env.APP_PORT as string, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    url:
      process.env.MONGO_CONNECTION_STRING ||
      'mongodb://admin:1234@localhost:27017/invoices',
    name: "invoices"
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '48h',
  },
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queues: {
      default: process.env.RABBITMQ_DEFAULT_QUEUE || 'default',
    },
  },
};
console.log(config);
export default config;
