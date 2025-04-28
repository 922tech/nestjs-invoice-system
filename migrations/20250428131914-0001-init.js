/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
import config from '../src/config';
export const up = async (db, client) => {
    const databaseName = config.database;

    // Create a dummy collection in the database to initialize it.
    const newDb = client.db(databaseName);
    await newDb.createCollection("dummy_collection");
    console.log(`Database '${databaseName}' created successfully.`);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    const databaseName = config.database;

    // Drop the database
    await client.db(databaseName).dropDatabase();
    console.log(`Database '${databaseName}' dropped successfully.`);
};
