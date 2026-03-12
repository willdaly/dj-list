'use strict';

var db = require('../../app/lib/db.js');
var connectMongo = require('../../app/lib/connect-mongo.js');
var dbname = process.env.DBNAME || 'dj-list';
var initPromise;

module.exports = fn=>{
  if (db.hasDb()) {
    return fn();
  }

  if (!initPromise) {
    initPromise = connectMongo(dbname).then(function(result) {
      db.setDb(result.db);
    });
  }

  initPromise.then(function() {
    fn();
  }).catch(function(err) {
    throw err;
  });
};
