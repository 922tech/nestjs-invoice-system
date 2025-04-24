export default ({
    app: {
      name: process.env.APP_NAME || 'MyApp',
      port: parseInt(process.env.APP_PORT as string, 10) || 3000,
      environment: process.env.NODE_ENV || 'development',
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME || 'user',
      password: process.env.DB_PASSWORD || 'password',
      name: process.env.DB_NAME || 'mydatabase',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'defaultSecret',
      expiresIn: process.env.JWT_EXPIRES_IN || '6h',
    },
  });