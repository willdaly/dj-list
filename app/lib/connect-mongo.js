'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = async function connectMongo(dbname) {
  const mongoUrl = `mongodb://localhost/${dbname}`;
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbname);
  await db.collection('songs').createIndex({Artist: 'text'});
  return {client: client, db: db};
};
