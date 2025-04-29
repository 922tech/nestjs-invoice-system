/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */

import config from '../migrate-mongo-config.js';

export const up = async (db, client) => {
    const databaseName = config.mongodb.url;
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    const databaseName = config.database.name;
    await client.db(databaseName).dropDatabase();
    console.log(`Database '${databaseName}' dropped successfully.`);
};
