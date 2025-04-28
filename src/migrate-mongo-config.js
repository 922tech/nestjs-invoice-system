const config = require('./config')

module.exports = {
    mongodb: {
      url: config.default.database.url,
      databaseName: config.default.database.name,
  
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  
    migrationsDir: "migrations", 
    changelogCollectionName: "changelog",
  };