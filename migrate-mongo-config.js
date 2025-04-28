// const config = require('./config')

module.exports = {
    mongodb: {
      url: process.env.MONGO_CONNECTION_STRING ||
      'mongodb://admin:1234@localhost:27017',
      databaseName: process.env.DATABASE_NAME || 'invoices',
  
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
   moduleSystem: 'esm',
    migrationsDir: "migrations", 
    changelogCollectionName: "changelog",
  };
