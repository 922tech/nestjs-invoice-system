
module.exports = {
    mongodb: {
      url: process.env.MONGO_CONNECTION_STRING ||
      'mongodb://admin:1234@localhost:27017',
      databaseName: process.env.DATABASE_NAME || 'invoice_system',
    },
   moduleSystem: 'esm',
    migrationsDir: "migrations", 
    changelogCollectionName: "changelog",
  };
