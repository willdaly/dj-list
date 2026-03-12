'use strict';

var db = require('../../app/lib/db.js');
var connectMongo = require('../../app/lib/connect-mongo.js');
var dbname = process.env.DBNAME || 'dj-list';
var initPromise;
var activeClient;

function initDb(fn){
  if (db.hasDb()) {
    if (fn) {
      fn();
      return;
    }
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = connectMongo(dbname).then(function(result) {
      activeClient = result.client;
      db.setDb(result.db);
    });
  }

  if (fn) {
    initPromise.then(function() {
      fn();
    }).catch(function(err) {
      fn(err);
    });
    return;
  }

  return initPromise;
}

initDb.close = async function() {
  if (activeClient) {
    await activeClient.close();
    activeClient = null;
  }
  db.setDb(null);
  initPromise = null;
};

module.exports = initDb;
