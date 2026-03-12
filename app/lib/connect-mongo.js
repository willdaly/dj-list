'use strict';

var MongoClient = require('mongodb').MongoClient;

module.exports = async function connectMongo(dbname) {
  var mongoUrl = 'mongodb://localhost/' + dbname;
  var client = new MongoClient(mongoUrl);
  await client.connect();
  var db = client.db(dbname);
  await db.collection('songs').createIndex({Artist: 'text'});
  return {client: client, db: db};
};
