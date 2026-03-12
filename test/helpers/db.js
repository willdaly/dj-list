'use strict';

const db = require('../../app/lib/db.js');
const connectMongo = require('../../app/lib/connect-mongo.js');
const dbname = process.env.DBNAME || 'dj-list';
let initPromise;
let activeClient;

async function initDb() {
  if (db.hasDb()) {
    return;
  }

  if (!initPromise) {
    initPromise = connectMongo(dbname).then(function (result) {
      activeClient = result.client;
      db.setDb(result.db);
    });
  }

  return initPromise;
}

initDb.close = async function () {
  if (activeClient) {
    await activeClient.close();
    activeClient = null;
  }
  db.setDb(null);
  initPromise = null;
};

module.exports = initDb;
